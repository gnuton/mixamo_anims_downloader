# Mixamo Animations downloader

## Download All
 `downloadAll.js` script makes use of mixamo2 API to download all anims for a single character that you choose.
 The animations are saved with descriptive long names instead of the short ones used by default by mixamo UI.

  How to use this script
  1. Browse mixamo.com
  2. Log in
  3. Open JS console (F12 on chrome)
  4. Download an animation and get the character ID from the Network tab
  5. Then past the character id in the "character" variable at beginning of this script
  6. Copy and paste the full script in the mixamo.com javascript console
  7. The script will open a new blank page.. you  will start to see animations downloading
  8. keep the blank page opened and keep on pressing "Allow multiple downlaods" 

Demo:

[![Demo on youtube](https://img.youtube.com/vi/EuAjnKAehGI/0.jpg)](https://www.youtube.com/watch?v=EuAjnKAehGI)

## Upload & Download
`upload&download.js` script makes use of mixamo API to upload all selected characters and then download all animations that you selected.
The animations are saved with index followed by motion description.

This script was originally written by gnuton@gnuton.org and then modified by yibowen@usc.edu, and the authors are not responsible of its usage

 How to use this script
 1. Browse mixamo.com
 2. Log in
 3. Right click Inspect (F12 on chrome) and goto `Elements` tab
 4. Right click `Edit as HTML`
 5. Insert `<input type="file" id="uploader" multiple>` after `<body>`
 6. You should see something like this on the top of the page: <input type="file" id="uploader" multiple>
 7. Click select and select all the characters (`.obj`, `.fbx`) you want to use
 8. Click `Console` tab and paste the full script in the mixamo.com console
 9. The script will open a new blank page and you  will start to see animations downloading
 10. Keep the blank page opened and keep on pressing "Allow multiple downlaods"