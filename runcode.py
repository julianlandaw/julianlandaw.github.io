# Importing Path from pathlib2 module
from pathlib2 import Path
from bs4 import *
import requests
import os
  
# Creating a function to
# replace the text in a string
def replacetext(string, search_text, replace_text):
    retstring = string
    ind = retstring.find(search_text)
    strlength = len(search_text)
    while (ind > -1):
        retstring = retstring[0:ind] + replace_text + retstring[(ind+strlength):]
        ind = retstring.find(search_text)
    return retstring    
  
with open('print.html', 'r') as f:
    html_string = f.read()
f.close()    

search_text = "<center>"
replace_text = "<left>"
html_string = replacetext(html_string, search_text, replace_text)

search_text = "</center>"
replace_text = "</left>"
html_string = replacetext(html_string, search_text, replace_text)

search_text = "</left></td><td w"
replace_text = "</left></td></tr><tr><td w"
html_string = replacetext(html_string, search_text, replace_text)

search_text = '%20'
replace_text = ' '
html_string = replacetext(html_string, search_text, replace_text)

search_text = 'src="'
replace_text = 'src ="/Users/julianlandaw/Library/Application Support/Anki2/JLandaw/collection.media/'
html_string = replacetext(html_string, search_text, replace_text)

soup = BeautifulSoup(html_string,'html.parser');
    
images = soup.findAll('img')

for i, image in enumerate(images):
    os.system('cp ' + '\'' + images[i]["src"] + '\'' + ' Images')

search_text = 'src ="/Users/julianlandaw/Library/Application Support/Anki2/JLandaw/collection.media/'
replace_text = 'src ="Images/'
html_string = replacetext(html_string, search_text, replace_text)

search_text = 'img { max-width: 100%'
replace_text = 'img { max-width: 75%; display: block; margin-left: auto; margin-right: auto; margin-bottom: auto'
html_string = replacetext(html_string, search_text, replace_text)
 
ind1 = html_string.find('<base href')
ind2 = html_string.find('</head>')

html_string = html_string[0:(ind1)] + html_string[ind2:]

text_file = open("formatted.html", "w")
n = text_file.write(html_string)
text_file.close()