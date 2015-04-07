# HNselect
![Badge of Honor](https://img.shields.io/badge/Built%20at-Fullstack-green.svg?style=flat-square)
> Follow your friends on HN. 
> The missing frontend for Hacker News.

## Table of Contents

- [Demo](#demo)
- [Motivation](#motivation)
- [Features](#features)
- [Installation](#installation)
- [Technology](#technology)
- [Roadmap](#roadmap)
- [Contributors](#contributors)
- [License](#license)

## Demo
### Screenshot

## Motivation

Hacker News is one of the most visited news and discussion sites in the startup and tech industry.
However, the site lacks the look and features you would expect from a modern website.
HNselect brings social feautures to HN through a Chrome Extension that contextualizes the site's content.

## Features
HNselect highlights stories and comments that are contribited by people you chose to follow. HN's DOM is manipulated to highlight relevant stories. A sidebar provides a functional UI providing a newsfeed of the stories relevant to you.
The main HN site is also manipulated highlighting stories and comments by people you follow. Click the "+" symbol next to a story to bookmark it and its comments context. Click the "+" symbol next to a username to follow this user. 

## Installation
	```
	npm install    # installs node packages
	bower install  # installs bower dependencies
	gulp           # when making changes to the extension's scripts
	```

Download the Chrome Extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/hnselect/jbbidiepnmelekfimfibcihoijpbibpa)

## Techonology
Chrome Extension that injects itself into the Hacker News website when accessing the page.
Upon load, the initial newsfeed is served by our backend ([Repo](https://github.com/crsmnd/HNselect-backend)). The newsfeed is then updated in realtime with the client listening for new items from the Hacker News Firebase API ([Repo](https://github.com/HackerNews/API)). 

### Roadmap

#### Potential future features

- Notifications: See comments to the stories and comments you posted 
- Live site updates: Update HN site with new stories and indicate when new comments are posted
- Inline commmenting in the sidebar
- Ability to view newsfeed content by keywords instead of following
- Live update view when new following are added or stories are bookmarked (currently reload is necessary)

#### Known bugs and missing functionality

- Karma, following and follower numbers not displaying yet
- Connection tab needs to be restyled
- Sidebar to stay open/closed upon site reload
- Reload of page should not rerequest newsfeed load from server (move from contentscript to background.js)
- Cleanup of codebase

## Contributors

* __Vincent Daranyi__ [LinkedIn](https://www.linkedin.com/in/vdaranyi) | [GitHub](https://github.com/crsmnd)
* __Glenn Davies__ [LinkedIn](https://www.linkedin.com/in/glennonymous) | [GitHub](https://github.com/glennonymous)
* __Michael Bae__ [LinkedIn](https://www.linkedin.com/in/michaelbae) | [GitHub](https://github.com/michaelbbae)

## License

This projected is licensed under the terms of the [MIT license](/LICENSE)
