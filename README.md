# Vuetalisk

Vuetalisk is a Static Site Generator based on `Static API` for  Vue with Jekyll like structure and markdown posts.

**IMORTANT This is still very early version**

Live DEMO : https://vuetal-nuxt-demo.netlify.com/

<p align="center"> <img src="http://i.imgur.com/3QUaAyo.png"> </p>

A basic idea is that Vuetalisk just writes a static JSON API from jekyll/hexo like markdown pages,
then Vue can fetch and `vuetify` them.

![basic idea](http://i.imgur.com/VxE4bG4.png)


# Install

We have [vuetalist-nuxt starter temlpate](https://github.com/qgp9/vuetalisk-nuxt)! Let's go with this.

```
vue init qgp9/vuetalisk-nuxt my-project
cd my-project
npm install # or yarn install
```

Since Vuetalisk provides build command, it's good idea to install it globally
```
npm install -g vuetalisk
vuetalisk -h

# or locally
chmod +x ./bin/vuetalisk
./bin/vuetalisk -h
```

# Set up

## Configruation
vuetalisk-nuxt starter template conains a simple `_config.yml` for pages, blog posts, data, static files
```yaml
strategy: nuxt
collections:
  blog:
    type: page
    path: _blog
    permalink: /blog/:year/:month/:day/:slug
    list: /blog/list
```
This config file is too simple, but Vuetalisk merges this with default confing.
Actual config after merging is [something like this](https://gist.github.com/qgp9/75e59b3ca54f061e61d6512d64766f74)

If you are fimilar with Jekyll or Hexo, configurations of the link could be just trivial.

## Post, Page
For Vuetalisk, every pages, posts, files belongs to their collection
With *current* configuration, you have 4 collections, pages, data, static, blog.
Vuetalisk ignores every files/directories begins with underbar('_') except collection entry point(path)

Under `site` which is `source_dir`
* `.` : `pages` collection which indicates usual page like `index.md`, `about.md` or `guide.md`. 
* `_blog`: `blog` collection. Simillar as posts of Jekyll
* `_static`: `static` collection. This contains any type of file, image, css, whatever
* `_data`: `data` collection. You can put and `.js`, `.json`, `.yaml`, `.toml` files here, and access later

Of course you can add your collections as you want

## Types
Every collection should have type field.

Vuetalisk has only 3 types; `page`, `data`, `file`. (and internally `list`)
* `file` doesn't have API, but just be served as usual file
* `data` has only API entry point.
* `page` has both of API and HTML.
