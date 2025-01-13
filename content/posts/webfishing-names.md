+++
date = '2024-10-18T15:33:56-0500'
draft = true
title = "WEBFISHING Steam Name BBCode Injection"
tags = ["Exploits", "PC"]
summary = "Using an injection exploit in a fishing game for maximum silliness."
+++

[WEBFISHING](https://store.steampowered.com/app/3146520/WEBFISHING/) has been taking up lots of my time recently. It's a really silly multiplayer game by [lamedev](https://lamedeveloper.itch.io/) where you can dress up as a silly animal and go fishing! It's got a big focus on just relaxing, socializing with the folks around you, and enjoying the time you have. The vibes are immaculate and if you haven't given it a try, I would highly recommend it!

I was recently playing online on v1.07 of the game when I started to notice that players had colored lobby names. As far as I knew, this wasn't a feature that was in the game, and I quickly picked up on the fact that these names were some sort of text injection exploit. So, I decided to look into it and I thought the results would make for an interesting blog post (instead of just a Twitter thread[^1]). I hope you think so too!

**The injection exploit discussed in this post has been patched out and no longer works in versions v1.08 and higher of WEBFISHING!** Thanks to lamedev for getting to this swiftly; it likely didn't pose any sort of major threat, but it's better to be safe than sorry with any sort of injection attack.

## Investigation

WEBFISHING is built on [Godot](https://godotengine.org/), an open-source game engine that has recently risen in popularity. Within the Godot engine, text can be displayed through the ``RichTextLabel`` class, which allows for text formatting via its [BBCode](https://en.wikipedia.org/wiki/BBCode) implementation. Incidentally, WEBFISHING uses ``RichTextLabel`` for its in-game chat box. While the developer had the foresight to purge the ``[`` and ``]`` characters from ordinary chat messages, player usernames were overlooked (I probably would have overlooked them too!) and were not sanitized. Since the chatbox was already utilizing BBCode internally and Steam usernames weren't purged of the brackets used in BBCode tags, players were able to use BBCode tags within their Steam usernames in order to modify the text in-game. Clever!

Naturally, instead of testing any of the existing color tags that people were using, I wanted to see if the tags could be used for something more interesting. So, I immediately jumped to ripping the game apart using bruvzg's [gdsdecomp](https://github.com/bruvzg/gdsdecomp/) tool. Looking into the recovered project, there were lots of interesting tidbits and placeholder files that could be found (left as an exercise for the reader). In particular, I was interested if images could be embedded. Taking a glance at Godot's documentation on the ``img`` BBCode tag, it notes that it can load "any valid ``Texture2D`` resource". So, I started off by attempting to load the game's icon, ``res://icon.png``. As it turns out, this is likely the only image that could have been used, as the other resource paths are far too long to fit within a Steam username (the whole string needed to fit into 32 characters).

![My WEBFISHING lobby with a name that injects the game's icon into the text.](/assets/img/posts/webfishing/icon_lobby.png)
_My WEBFISHING lobby with a Steam name that injects the game's icon into the text._

![My WEBFISHING character with a name that injects the game's icon into the text.](/assets/img/posts/webfishing/icon_ingame.png){: w="400" }
_My WEBFISHING character in-game with a Steam name that injects the game's icon into the text._

Initial testing started with the Steam username ``[img]res://icon.png[/img]``, which proved to be a success. In the lobby list, in chat boxes, and above my character's head, the funny little cat icon was there! The first time I discovered this I abandoned the rest of my planned testing and just hung out in the game, hosting a lobby with my silly new icon name. Lots of folks joined out of curiosity and lots more stayed just to fish; it was a good time!

## Further Testing

After the exploit was patched out in v1.08, I decided to revisit v1.07 (thank goodness for [SteamDB](https://steamdb.info/) and [DepotDownloader](https://github.com/SteamRE/DepotDownloader)) and test out all the different BBCode effects to see what they did, since I missed out on the color fun!

Here's a rundown of what the different text tags did:
- ``b``, ``i``, and ``code`` removed the outline from the above-head text and made it taller, but did not achieve their intended effects. No effect on chat or lobby list.
- ``u`` and ``s`` added their intended effects to chat, lobby, and above-head text (with the above-head effect being very faint).
- ``center``, ``right``, and ``indent`` added their intended effects to chat, lobby, and above-head text (``right`` moved the above-head text very far to the right).
- ``left`` had no effect, and wasn't even parsed out as BBCode. I suspect this is because most text is already left-justified, but I thought it was interesting to note.
- ``fill`` had the expected effect of ``left``, left-justifying the above-head name very far to the left.
- ``url`` functioned the same as ``u``, as Godot doesn't attach any code to the ``meta_clicked`` signal of URLs by default.
- ``img`` embedded an image, like shown above. Unfortunately, Godot doesn't allow embedding of external image resources. (I bought the domain ``rsv.my`` to try this, and I wanted the image I used to be ![Freakynite.](/assets/img/posts/webfishing/freaky.png), such a shame it didn't work...)
- ``color``, as previously established, changed the color of the chat, lobby, and above-head text to the specified color in the tag. In particular, it overrode the chat name color, which is usually the primary color of your character's fur.
- ``bgcolor``, ``fgcolor``, and ``pulse`` were also not parsed as BBCode and have no effect.
- ``wave``, ``tornado``, ``shake``, ``fade``, and ``rainbow`` all changed the chat, lobby, and above-head text to utilize their respective effects. However, the above-head text was never animated if the text effect was.

Another fun tidbit is that if you didn't close a BBCode tag (say, ``rainbow``), all other chat messages after a person with that tag in their name had sent a message would have that effect! This is because WEBFISHING utilizes a single string that is concatenated upon for its chat box, so BBCode tags that get pushed onto the stack are never popped off unless someone with a closing tag in their name sends a message. This can lead to fun scenarios where you end up with several text effects stacked and combined, which results in something like this:

![The WEBFISHING chatbox, combining the rainbow, tornado, and wave effects through username injection.](/assets/img/posts/webfishing/chaos.png){: w="400" }
_The WEBFISHING chatbox, combining the rainbow, tornado, and wave effects through username injection._

## Conclusion

Be vigilant, injection attacks can happen anywhere! Luckily, this was a very silly and harmless example of one, and from my knowledge no one devised a way to take advantage of this in some nefarious way for the short while it was in the game. It was fun while it lasted... Big props to lamedev once again for tackling this issue quickly! Hopefully fun name colors will make a return to the game one day...

Again, if you haven't checked out WEBFISHING, please go pick it up on Steam and give it a go with some friends, it's a really good time and you're supporting a small indie developer while doing so!

Thanks for reading!

\- Kai

[^1]: [My original WEBFISHING name injection Twitter thread](https://x.com/resistivkai/status/1846617621577289805)
