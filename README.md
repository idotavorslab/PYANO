node --experimental-modules --es-module-specifier-resolution=node --enable-source-maps ./node_modules/.bin/electron .

# Important: Always run terminal as Administrator (right click a program's icon -> run as admin)

# Pyano Installation

## Enable viewing hidden files on Windows Explorer
Main Explorer menu => view => check both "Hidden items" and "File name extensions"

## Install VSCode
https://code.visualstudio.com/download
Check all checkboxes during installation

## git
### Install
https://gitforwindows.org/    
When asked, select "Use visaul studio code as git's default editor".
Otherwise, just press "next".

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

    nvm install 13.5.0
Check if installed correctly:
    
    nvm list    
Should display `* 13.5.0 (Currently using 64-bit executable)`

## 2. Clone Pyano
    cd C:\
    git clone https://github.com/idotavorslab/PYANO.git
    cd PYANO

## 3. Set local node version
From within `PYANO` root folder (that's `C:\PYANO`)
    
    nvm use 13.5.0
Should see `Now using node v13.5.0 (64-bit)`.

Check versions:

    node -v
Should see `v13.5.0`.

    npm -v
Should see `6.13.4`.

## Install Pyano
From within PYANO root folder:

    # npm install electron-forge@5.2.4 -g
    # npm install electron-prebuilt-compile@4.0.0 -g
	# npm install typescript -g
	npm install sweetalert2@8.2.6 -E
	npm install jquery@3.3.1 -E
	npm install midiconvert@0.4.7 -E
	npm install @tonejs/midi@1.2.0 -E
	npm install tone@13.7.4 -E
    npm install --save-exact
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
### Create virtualenv
With you terminal, `cd` into `C:\PYANO\src\engine`, and run:
    
    virtualenv env
Then, run

    env\scripts\activate
Check if ok:

    pip list
Should only see `pip`, `setuptools`, and `wheel`. Also, your shell may be starting with `(env)` now (that's good).

## Install requirements
### 1st step
    pip install -r requirements.txt
May take a while, get yourself a coffe. Once done:

### 2nd step
    pip install -e .
   
### Now check:
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


