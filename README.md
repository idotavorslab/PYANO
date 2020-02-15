# Important: Always run terminal as Administrator (right click a program's icon -> run as admin)

# Pyano Installation

## Enable viewing hidden files on Windows Explorer
Main Explorer menu => view => check both "Hidden items" and "File name extensions"

## Install VSCode
https://code.visualstudio.com/download

## git
### Install
https://gitforwindows.org/    
When asked, select "Use viaul studio code as git's default editor"

Otherwise, "next".
### Set config
From terminal:
    
    git config --global user.email "idotavorslab@gmail.com"
    git config --global user.name "ITLab"
    
## Install nvm
https://github.com/coreybutler/nvm-windows/releases

Check if installed: run
    
    nvm -v

Should see 

    Running version <whatever>


## 1. Install node.js

    nvm install 12.13.0
Check if installed correctly:
    
    nvm list    
Should display `* 12.13.0 (Currently using 64-bit executable)`

## 2. Clone Pyano
    cd C:\
    git clone https://github.com/idotavorslab/PYANO.git
    cd PYANO

## 3. Set local node version
From within `PYANO` root folder (that's `C:\PYANO`)
    
    nvm use 12.13.0
Should see `Now using node v12.13.0 (64-bit)`.

Check versions:

    node -v
Should see `v12.13.0`.

    npm -v
Should see `6.12.0`.

## Install Pyano
From within PYANO root folder:

    npm install electron-forge@5.2.4 -g
    npm install electron-prebuilt-compile@4.0.0 -g  ?
    npm install
This may take awhile. Then run:

    git checkout node_modules/pyano_local_modules

## Install Python (3.7.6)
https://www.python.org/downloads/release/python-376/

(specifically for windowsx64bit: https://www.python.org/ftp/python/3.7.6/python-3.7.6-amd64.exe)
    
    Add python to PATH
    Customize installation -> Check everything then Next -> Check everything -> Install

### Run:

    python
Should see `>>> Python 3.7.6`. 
If you don't, try re-opening terminal.

To exit press Ctrl+Z then Enter.

### Install virtualenv
    pip install virtualenv
Check if installed correctly:
    
    virtualenv --version
Should see: `virtualenv 20.0.4 from c:\program files\python37\lib\site-packages\virtualenv\__init__.py`
(Or something similar)

## Install the correct Pyano's python virtual environment
### Check requirements.txt
From within `PYANO` root folder,
    
    code .
This will launch VSCode on `PYANO`'s dir.

Go to `src\engine`, and edit `requirements.txt`. A line that starts with `-e` should have the correct path. Assuming you installed `PYANO` in `C:\PYANO`, then the `-e` line should be:
    
    -e "C:\PYANO\src\engine"


### Create virtualenv
With you terminal, `cd` into `C:\PYANO\src\engine`, and run:
    
    virtualenv env
Then, run

    env\scripts\activate
Check if ok:

    pip list
Should only see `pip`, `setuptools`, and `wheel`. Also, your shell may be starting with `(env)` now (that's good).

## Install requirements
    pip install -r requirements.txt
May take a while, get yourself a coffe. Once done:

    pip list
Should see a longer list of packages, including `pyano`, with `c:\pyano\src\engine` under `Location` column.

## Install ffmpeg
https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-4.2.2-win64-static.zip
If that link's broken:
https://ffmpeg.zeranoe.com/builds/
Create dir: `C:\ffmpeg`
Open the zip file you downloaded, double click the only dir, copy the content into `C:\ffmpeg`. 
The resulting content inside `C:\ffmpeg` should be 3 dirs: `bin, doc, presets` and 2 `.txt` files.

# Running Pyano
	npm start
**You may get an ugly error, that's ok**. Close errors, close Pyano window, run `npm start` again.


