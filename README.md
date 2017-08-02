# Vuetalisk
[![Gitter chat](https://badges.gitter.im/qgp9/Vuetalisk.png)](https://gitter.im/qgp9/Vuetalisk)
[![npm version](https://badge.fury.io/js/vuetalisk.svg)](https://badge.fury.io/js/vuetalisk)

Vuetalisk is a Static Site Generator based on `Static API` for  Vue with Jekyll like structure and markdown posts.

**IMPORTANT This is still very early version**

* Live DEMO : https://vuetal-nuxt-demo.netlify.com/
* Documents : https://github.com/qgp9/Vuetalisk/wiki
* Getting Started : https://github.com/qgp9/Vuetalisk/wiki/Guide-Getting-Started

A basic idea is that Vuetalisk just writes a static JSON API from jekyll/hexo like markdown pages,
then Vue can fetch and `vuetify` them.

# Features
* Customisable plugin based archtecture inspired by `MetalSmith`.
* Static API first. Any application which support ajax can be used as a frontend besides Vue
* Helper for Nuxt/SSR for SEO.
* [WIP] Helper for Vue/SPA both of history/hash routing
* Jekyll/Hexo like directory structure and markdown page/posts 

# Install

We have [vuetalisk-nuxt starter template](https://github.com/qgp9/vuetalisk-nuxt)! Let's go with this.

```
vue init qgp9/vuetalisk-nuxt my-project
cd my-project
npm install # or yarn install
```

Since Vuetalisk provides build command, good to install it globally or just `npx`
```
npm install -g vuetalisk
vuetalisk -h
vuetalisk build --all

# or by npx

npx vuetalisk -h
npx vuetalisk build --all
```

# Basic Idea
![basic idea](http://i.imgur.com/VxE4bG4.png)

# Structure
![strecture](http://i.imgur.com/AwG5x1W.png)

