# Columbine Music Center
Update an existing install: unzip over the old folder, then `bash build.sh`.
Run without building: `npm start`. Add music with Cmd+O.
Library + Last.fm settings live in ~/Library/Application Support/cart3r-player/


## Build the Windows installer without PowerShell

1. Upload this project folder to a GitHub repository.
2. Open the repository's **Actions** tab.
3. Select **Build CMC Windows installer**, then choose **Run workflow**.
4. When the workflow finishes, open the run and download the **CMC-Setup-1.0.0** artifact.

The downloaded artifact contains `CMC-Setup-1.0.0.exe`. This project ZIP contains the source and automated build workflow; it is not itself the compiled installer.
