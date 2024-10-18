---
title: WEBFISHING Steam Name BBCode Injection
author: kai
date: 2024-10-18 00:00:00 -0600
# last_modified_date: 
categories: [Exploits, PC]
tags: [exploits, pc, injection]

image:
  path: "./assets/img/posts/webfishing/banner.png"
  alt: A screenshot from WEBFISHING, where my player is fishing on the pier with the game's icon as their username.
---

## Introduction

[WEBFISHING](https://store.steampowered.com/app/3146520/WEBFISHING/) has been taking up lots of my time recently. It's a really silly multiplayer game by [lamedev](https://lamedeveloper.itch.io/) where you can dress up as a silly animal and go fishing! It's got a big focus on just relaxing, socializing with the folks around you, and enjoying the time you have. The vibes are immaculate and if you haven't given it a try, I would highly recommend it!

I was recently playing online on v1.07 of the game when I started to notice that players had colored lobby names. As far as I knew, this wasn't a feature that was in the game, and I quickly picked up on the fact that these names were some sort of text injection exploit. So, I decided to look into it and I thought the results would make for an interesting blog post. I hope you think so too!

**The injection exploit discussed in this post has been patched out and no longer works in versions v1.08 and higher of WEBFISHING!** Thanks to lamedev for getting to this swiftly; it likely didn't pose any sort of major threat, but it's better to be safe than sorry with any sort of injection attack.

## Investigation

WEBFISHING is built on [Godot](https://godotengine.org/), an open-source game engine that has recently risen in popularity. Within the Godot engine, text can be displayed through the ``RichTextLabel`` class, which allows for text formatting via its [BBCode](https://en.wikipedia.org/wiki/BBCode) implementation. Incidentally, WEBFISHING uses ``RichTextLabel`` for its in-game chat box. While the developer had the foresight to purge the ``[`` and ``]`` characters from ordinary chat messages, player usernames were overlooked (I probably would have overlooked them too!) and were not sanitized. Since the chatbox was already utilizing BBCode internally and Steam usernames weren't purged of the brackets used in BBCode tags, players were able to use BBCode tags within their Steam usernames in order to modify the text in-game. Clever!

Naturally, instead of testing any of the existing color tags that people were using, I wanted to see if the tags could be used for something more interesting. So, I immediately jumped to ripping the game apart using bruvzg's [gdsdecomp](https://github.com/bruvzg/gdsdecomp/) tool. Looking into the recovered project, there were lots of interesting tidbits and placeholder files that could be found (left as an exercise for the reader). In particular, I was interested if images could be embedded. Taking a glance at Godot's documentation on the ``img`` BBCode tag, it notes that it can load "any valid ``Texture2D`` resource". So, I started off by attempting to load the game's icon, ``res://icon.png``. As it turns out, this is likely the only image that could have been used, as the other resource paths are far too long to fit within a Steam username (the whole string needed to fit into 32 characters).

![My WEBFISHING lobby with a name that injects the game's icon into the text.](/assets/img/posts/webfishing/icon_lobby.png)
_My WEBFISHING lobby with a Steam name that injects the game's icon into the text._

![My WEBFISHING character with a name that injects the game's icon into the text.](/assets/img/posts/webfishing/icon_ingame.png){: w="400" }
_My WEBFISHING character in-game with a Steam name that injects the game's icon into the text._

Initial testing started with the Steam username ``[img]res://icon.png[/img]``, which proved to be a success. In the lobby list, in chat boxes, and above my character's head, the funny little cat icon was there! The first time I discovered this I abandoned the rest of my planned testing and just hung out in the game, hosting a lobby with my silly new icon name. Lots of folks joined out of curiosity and lots more stayed just to fish; it was a good time!

## Conclusion



Thanks for reading!

\- Kai
