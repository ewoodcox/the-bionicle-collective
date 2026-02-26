# Set photo organization (collection page)

To add your own photos for sets, you only need to **put image files in one folder** and name them by set ID. No JSON or code edits required.

## What you need

1. **Folder**  
   Put all set photos in:
   ```text
   public/set-photos/
   ```

2. **Filename = Set ID + `.jpg`**  
   Each file must be named exactly like the set’s ID, with a `.jpg` extension, for example:
   - `tahu-2001.jpg`
   - `gali-2001.jpg`
   - `8534-2001.jpg` (if that’s the set ID)

3. **Finding the Set ID**  
   - Open any set’s page (e.g. “Tahu” from 2001).  
   - The URL is: `.../collection/<set-id>/`  
   - So for `.../collection/tahu-2001/` the set ID is **`tahu-2001`** → your file should be **`tahu-2001.jpg`**.

## How it works

- If a file exists at `public/set-photos/<set-id>.jpg`, the site uses that image.
- If not, the site falls back to the existing placeholder (or whatever is in the data for that set).

## Summary

| You do | App does |
|--------|----------|
| Put `tahu-2001.jpg` in `public/set-photos/` | Shows your photo for Tahu (2001) |
| No file for a set | Shows placeholder / existing image |
| No edits to JSON or code | Uses filename convention to pick the image |

**Preferred format:** JPG, so we use a single extension (`.jpg`) for simplicity. If you only have PNGs, you can rename to `.jpg` (some browsers still show them) or we can add support for multiple extensions later.
