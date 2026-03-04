use serde::Serialize;
use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;

#[derive(Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub modified: u64,
    pub children: Option<Vec<FileEntry>>,
}

fn collect_entries(dir: &Path) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();

    let read_dir = fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in read_dir {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        let name = entry
            .file_name()
            .to_string_lossy()
            .to_string();

        // Skip hidden files/folders
        if name.starts_with('.') {
            continue;
        }

        let metadata = entry
            .metadata()
            .map_err(|e| format!("Failed to read metadata: {}", e))?;

        let modified = metadata
            .modified()
            .unwrap_or(UNIX_EPOCH)
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        let is_dir = metadata.is_dir();

        if is_dir {
            let children = collect_entries(&path)?;
            entries.push(FileEntry {
                name,
                path: path.to_string_lossy().to_string(),
                is_dir: true,
                modified,
                children: Some(children),
            });
        } else if name.ends_with(".md") {
            entries.push(FileEntry {
                name,
                path: path.to_string_lossy().to_string(),
                is_dir: false,
                modified,
                children: None,
            });
        }
    }

    // Sort: directories first, then alphabetically
    entries.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(entries)
}

#[tauri::command]
pub fn list_files(path: String) -> Result<Vec<FileEntry>, String> {
    let dir = Path::new(&path);
    if !dir.exists() {
        return Err(format!("Directory does not exist: {}", path));
    }
    if !dir.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }
    collect_entries(dir)
}

#[tauri::command]
pub fn read_note(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file '{}': {}", path, e))
}

#[tauri::command]
pub fn save_note(path: String, content: String) -> Result<(), String> {
    // Ensure parent directory exists
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to save file '{}': {}", path, e))
}

#[tauri::command]
pub fn create_note(name: String, dir_path: String) -> Result<String, String> {
    let file_name = if name.ends_with(".md") {
        name
    } else {
        format!("{}.md", name)
    };

    let full_path = Path::new(&dir_path).join(&file_name);

    if full_path.exists() {
        return Err(format!("File already exists: {}", full_path.display()));
    }

    // Ensure parent directory exists
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    fs::write(&full_path, "").map_err(|e| format!("Failed to create file: {}", e))?;

    Ok(full_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn delete_note(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("File does not exist: {}", path));
    }
    fs::remove_file(p).map_err(|e| format!("Failed to delete file '{}': {}", path, e))
}

#[tauri::command]
pub fn rename_note(old_path: String, new_path: String) -> Result<(), String> {
    let old = Path::new(&old_path);
    if !old.exists() {
        return Err(format!("File does not exist: {}", old_path));
    }

    let new = Path::new(&new_path);
    if new.exists() {
        return Err(format!("A file already exists at: {}", new_path));
    }

    // Ensure parent directory of new path exists
    if let Some(parent) = new.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    fs::rename(old, new).map_err(|e| format!("Failed to rename file: {}", e))
}

#[tauri::command]
pub fn create_folder(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create folder '{}': {}", path, e))
}

#[tauri::command]
pub fn delete_folder(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Folder does not exist: {}", path));
    }
    fs::remove_dir_all(p).map_err(|e| format!("Failed to delete folder '{}': {}", path, e))
}

#[tauri::command]
pub fn rename_folder(old_path: String, new_path: String) -> Result<(), String> {
    let old = Path::new(&old_path);
    if !old.exists() {
        return Err(format!("Folder does not exist: {}", old_path));
    }
    let new = Path::new(&new_path);
    if new.exists() {
        return Err(format!("A folder already exists at: {}", new_path));
    }
    fs::rename(old, new).map_err(|e| format!("Failed to rename folder: {}", e))
}
