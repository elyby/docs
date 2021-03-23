#!/usr/bin/env python

import os
import re
import shutil
import subprocess
import sys

from glob import glob
from pathlib import Path
from lxml import html, etree

base_lang: str = "ru"
build_dir: str = "build"
per_lang_static: list[str] = [
    r"documentation_options\.js",
    r"language_data\.js",
    r"^(?!basic)\w+-stemmer\.js",
    r"translations\.js",
]

# Cleanup
shutil.rmtree(build_dir, True)
os.mkdir(build_dir)

# Build languages
def sphinx_build(lang: str) -> None:
    subprocess.run([
        sys.executable, "-m", "sphinx",
        "-b", "html",
        "-D", f"language={lang}",
        "source",
        f"{build_dir}/{lang}",
    ])

languages: list[str] = [base_lang]
if os.path.isdir("locale"):
    languages += os.listdir("locale")

index_page_lang: str = "en" if "en" in languages else base_lang

for lang in languages:
    sphinx_build(lang)

# Extract common assets
for i, lang in enumerate(languages):
    if i == 0:
        os.rename(f"{build_dir}/{lang}/_downloads", f"{build_dir}/_downloads")
        os.rename(f"{build_dir}/{lang}/_images", f"{build_dir}/_images")
        os.rename(f"{build_dir}/{lang}/CNAME", f"{build_dir}/CNAME")
        os.rename(f"{build_dir}/{lang}/.nojekyll", f"{build_dir}/.nojekyll")
    else:
        shutil.rmtree(f"{build_dir}/{lang}/_downloads")
        shutil.rmtree(f"{build_dir}/{lang}/_images")
        os.remove(f"{build_dir}/{lang}/CNAME")
        os.remove(f"{build_dir}/{lang}/.nojekyll")

    for static_file in glob(f"{build_dir}/{lang}/_static/**/*", recursive=True):
        if not os.path.isfile(static_file):
            continue

        relative_path = static_file.removeprefix(f"{build_dir}/{lang}/_static/")
        matched: bool = False
        for pattern in per_lang_static:
            if re.match(pattern, relative_path):
                matched = True
                break

        # I have no idea how to make "continue 2" from the loop above so...
        if matched:
            continue

        dir = os.path.dirname(relative_path)
        os.makedirs(f"{build_dir}/_static/{dir}", exist_ok=True)
        os.rename(static_file, f"{build_dir}/_static/{relative_path}")

    shutil.rmtree(f"{build_dir}/{lang}/_sources")
    shutil.rmtree(f"{build_dir}/{lang}/.doctrees")
    os.remove(f"{build_dir}/{lang}/.buildinfo")
    os.remove(f"{build_dir}/{lang}/objects.inv")

# Convert all relative routes into absolute
def make_links_absolute(file_path: str, link: str) -> str:
    # Skip local anchor links
    if link.startswith("#"):
        return link

    # Skip external links (including links without protocol "//ely.by")
    if link.startswith("//") or re.match(r"^https?://", link):
        return link

    if ".html" in link:
        working_directory = os.getcwd()
        os.chdir(Path(file_path).parent.absolute())
        resolved = str(Path(link).resolve())
        os.chdir(working_directory)

        link = resolved.removeprefix(f"{working_directory}/{build_dir}")
        link = link.replace("\\", "/") # fix for the Windows

        return link

    # Other links are links to some static assets
    # There is no need to resolve relative links since _static is placed in the root directory,
    # so after removing all ../ parts we can safely append / to make the path absolute
    while link.startswith("../"):
        link = link.removeprefix("../")

    no_static_link = link.removeprefix("_static/")
    for pattern in per_lang_static:
        if re.match(pattern, no_static_link):
            lang = re.match(fr"^{build_dir}/(\w+)/", file_path).group(1)

            return f"/{lang}/{link}"

    return f"/{link}"

for file in glob(f"{build_dir}/**/*.html", recursive=True):
    tree = html.parse(file) # type: etree._ElementTree
    root = tree.getroot() # type: html.HtmlElement

    root.rewrite_links(lambda link: make_links_absolute(file, link))

    tree.write(file, method="html", encoding="UTF-8")

# Create index.html for the site root
shutil.copyfile(f"{build_dir}/{index_page_lang}/index.html", f"{build_dir}/index.html")
index_file_tree = html.parse(f"{build_dir}/index.html") # type: etree._ElementTree
index_file_root = index_file_tree.getroot() # type: html.HtmlElement
index_file_last_toctree = index_file_root.find_class("toctree-wrapper")[0] # type: html.HtmlElement

for lang in languages:
    if lang == index_page_lang:
        continue

    tree = html.parse(f"{build_dir}/{lang}/index.html") # type: etree._ElementTree
    root = tree.getroot() # type: html.HtmlElement

    toctree = root.find_class("toctree-wrapper")[0] # type: html.HtmlElement
    index_file_last_toctree.addnext(toctree)

    index_file_last_toctree = index_file_root.find_class("toctree-wrapper")[-1] # type: html.HtmlElement

index_file_tree.write(f"{build_dir}/index.html", method="html", encoding="UTF-8")

# Add cross-lang links to the sidebar
sidebar_menus: dict[str, html.HtmlElement] = {}
for lang in languages:
    tree = html.parse(f"{build_dir}/{lang}/index.html") # type: etree._ElementTree
    root = tree.getroot() # type: html.HtmlElement

    sidebar_menus[lang] = root.find_class("wy-menu")[0]

for file in glob(f"{build_dir}/**/*.html") + [f"{build_dir}/index.html"]:
    result = re.match(fr"^{build_dir}/(\w+)/", file)
    lang: str = result.group(1) if result is not None else index_page_lang

    tree = html.parse(file) # type: etree._ElementTree
    root = tree.getroot() # type: html.HtmlElement

    sidebar_menu_last = root.find_class("wy-menu")[0] # type: html.HtmlElement
    for menuLang in sidebar_menus:
        if menuLang == lang:
            continue

        sidebar_menu_last.addnext(sidebar_menus[menuLang])
        sidebar_menu_last = root.find_class("wy-menu")[-1] # type: html.HtmlElement

    tree.write(file, method="html", encoding="UTF-8")
