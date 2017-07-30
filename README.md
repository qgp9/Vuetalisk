# [WIP] Vuetalisk

Vuetalisk is a Static Site Generator based on `Static API` for  Vue.

*IMORTANT This is still uneder development*

Live DEMO : https://vuetal-nuxt-demo.netlify.com/

<p align="center"> <img src="http://i.imgur.com/3QUaAyo.png"> </p>

A basic idea is that Vuetalisk just writes a static JSON API from jekyll/hexo like markdown pages,
then Vue can fetch and `vuetify` them.

![basic idea](http://i.imgur.com/VxE4bG4.png)


# Install

Since Vutalisk proive a set of commands, let's install it globally

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



