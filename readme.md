# Ananda Yoga Lander Website

This website began as a side-project for learning new technologies, namely Node, Express, and MongoDB. Over time, it turned into something that might just come to replace the actual studio website. 

For now, though, it's a work-in-progress.

## WIP

### Bugs

* Handle canceled classes (instructor becomes "Class Cancelled?")

### Posts

* [ ] post versioning - saving, just need to load/display
* [ ] delete posts
* [ ] Sort posts by published/draft on admin
* [ ] post paging on admin?
* [ ] Infinite scroll main page/archive

### General Site Stuff

* [ ] line up titles on home page
* [ ] retail store WYSIWIG
* [ ] pricing & membership (see WYSIWIG)
* [x] MBO substitutions!
* [ ] Save photos to azure blob? Need to decide on hosting...

### Refactor

* [ ] Remove jQuery soup in favor of SPA for client-side admin. Angular? Ember? 
* [ ] Do real session tracking for admin
* [ ] Make PagesDB calls from an async nunjucks helper, moving those lookups out of the controller. (Downside: Breaks down asynchronicity a bit. Upside: Cleaner code & models)
* [ ] After the first two posts, show posts on the homepage in a col-md-6 format, excerpt:50

### SEO

* [ ] twitter card
* [ ] open graph metas
* [ ] meta descriptions
* [ ] title matches h1?
* [ ] keyword ideas: ananda yoga, lander, lander yoga, lander wyoming

##Getting Started

```
npm install
npm start
```
