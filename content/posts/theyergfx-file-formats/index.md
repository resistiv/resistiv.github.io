---
title: TheyerGFX's Custom File Formats
author: Kai NeSmith
date: 2024-02-25 23:36:39 -0600
tags: [file formats, ps1]
---

{{< figure
  src="gamess1.png"
  width="65%"
  caption="A screenshot from California Watersports, where the character Chook is building up speed to catch a wave in the surfing free-play mode."
  loading="lazy"
>}}

Around February 2020, I stumbled upon the game _California Watersports_ for the PlayStation 1. I don't remember exactly how I found it, but I vividly remember the colorful Comic Sans logo of the developer, [TheyerGFX](https://theyergfx.com/), being the thing that drew my attention and led me to dig into the game.

_California Watersports_ began as the Net Yaroze demo _Surf Game_, developed by Mark Theyer of TheyerGFX[^1]. After the demo was published in the 77th issue of the European PlayStation Magazine[^2], Midas Interactive Entertainment signed a deal with Theyer to complete a full version of the game. After poor sales of _California Watersports_, the individual sports in the game were split out into their own budget releases, being _Jetracer_, _Pro Body Boarding_, and _Windsurfers Paradise_. Additionally, it seems like _California Watersports_ was modified and re-released as _All Star Watersports_ at a later date. TheyerGFX would also go on to release _California Surfing_, which took on a more stylized approach to the previous games.

Since this game and its spin-offs had piqued my interest, I decided to take a bit of time to dig into its file formats (as I tend to do). In doing so, I ended up reverse-engineering the PAK, MIB, and P1I formats. I even made an image viewer/extractor for it to try to learn Windows Forms, which you can find over in the [TheyerImageViewer repo](https://github.com/resistiv/TheyerImageViewer).

However, unlike most of the games I've researched, that isn't where the story ends. I kept finding myself thinking about the rather "indie" origins of _California Watersports_ and revisiting the developer's website, where eventually I noticed Mark Theyer's email. On a whim, I decided to shoot him a message and see if he would be privy to answering some questions and releasing the source code to the games. To my surprise, he got back to me very quickly, answered all of my questions, and even passed the source code for the games (excluding _California Surfing_) onto me, with explicit permission for it to be publicly distributed! Said source code now lives over on [its own page on the Internet Archive](https://archive.org/details/cws-src), where anyone can go and have a look at it. I haven't tried building it or getting it in any working order, so it is presented exactly as I received it. The Q&A is also included in a text file within the archive (try not to judge the questions too harshly, I wasn't exactly a journalist at 16).

## PAK Format

PAK files are a way of grouping like files, such as a model, its textures, and those textures' colormaps. The format is fairly simple, with a small header and succinct file entries. All values are little-endian.

The header looks like:

| Data Type | Description                                  |
|:----------|:---------------------------------------------|
| char[4]   | The PAK magic ID, ``PAK`` (null-terminated). |
| uint32    | The number of file entries.                  |

The header is followed by a list of all of the file entries, which each look like:

| Data Type | Description                             |
|:----------|:----------------------------------------|
| char[32]  | The file name (null-terminated).        |
| uint32    | The length of the file.                 |
| uint32    | The offset of the file data in the PAK. |

The entries are followed by all of the file data, which is arranged per file like:

| Data Type     | Description                           |
|:--------------|:--------------------------------------|
| uint8[``n``]  | Data of this file.                    |

## Image Formats

Both formats are little-endian and seemingly use the PlayStation RGBA color format for 16-bit color. For a quick guide on that, go check out Jack Robinson's wonderfully stylish [blog post about parsing TIM files](https://jackrobinson.co.nz/blog/tim-image-parsing/), you'll find all the info you need under the "CLUT" heading. (I just found his site but I absolutely love his blog, it's pure eye-candy!)

### MIB Format

_California Watersports_ and its descendants use the "My Image Binary", or MIB, image format for all images and textures. Images can be 8 or 16 bits-per-pixel, with 8 bpp images using a second MIB file as a "colormap" (palette). Colormap MIBs have the extension ``.cmb`` (presumably standing for "Colormap Binary"), while an ordinary MIB will have the extension ``.mib``.

Of important note, the colormap file name field within the MIB header of 8 bpp images will not contain the ``.cmb`` extension, being only the base name of the target file. The colormap field will be all zero bytes for 16 bpp images.

A MIB file looks like:

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| char[4]      | The MIB magic ID, ``MIB`` (null-terminated).                   |
| int32        | Bits per pixel; either ``8`` or ``16``.                        |
| int16        | Width of image in pixels.                                      |
| int16        | Height of image in pixels.                                     |
| char[16]     | Colormap file name (null for 16 bpp images).                   |
| uint8[``n``] | Data of the image, ``n`` being ``width * height * (bpp / 8)``. |

{{< figure
  src="mibexample.png"
  width="65%"
  caption="An example MIB image from California Watersports (DATA/IMAGES/FRONTEND.PAK/beach.mib)."
  loading="lazy"
>}}

Colormap MIBs are structurally the same as an ordinary MIB, with some specific requirements. Colormaps will always be 16 bpp (and therefore have a null colormap field), have a height of 1 pixel, and have a width representative of the number of colors in the colormap. Each pixel in the parent 8 bpp image of the colormap will be an index to a color in the colormap (zero-indexed).

{{< figure
  src="colormap.png"
  width="100%"
  caption="An example colormap from California Watersports (DATA/IMAGES/FRONTEND.PAK/jetski.cmb) rendered as a normal image (upscaled 2x)."
  loading="lazy"
>}}

### P1I Format

For the later game _California Surfing_, a slight modification was made to the format. I believe this was done as development shifted towards the PS2, meaning there was a need to differentiate PS2 images and PS1 images. So, _California Surfing_ uses the "PlayStation 1 Image", or P1I, format.

This format changed the magic ID and extensions of the files; the magic ID became ``P1I``, image files use ``.p1i``, and colormap files use ``.p1c`` (presumably standing for "PlayStation 1 Colormap"). Additionally, the data size of the width and height were increased to 32-bit values.

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| char[4]      | The P1I magic ID, ``P1I`` (null-terminated).                   |
| uint32       | Bits per pixel; either ``8`` or ``16``.                        |
| uint32       | Width of image in pixels.                                      |
| uint32       | Height of image in pixels.                                     |
| char[16]     | Colormap file name (null for 16 bpp images).                   |
| uint8[``n``] | Data of the image, ``n`` being ``width * height * (bpp / 8)``. |

{{< figure
  src="p1iexample.png"
  width="40%"
  caption="An example P1I image from California Surfing (DATA/IMAGES/SCREENS/BACK1.P1I)."
  loading="lazy"
>}}

## Model Formats

### MMB Format

Admittedly, I haven't studied or implemented the model format used within the _California Watersports_ family of games, but there is a rather in-depth format specification within the source code that Mark provided. I've attempted to adapt that specification below, which is for the "My Model Binary" format, or MMB.

Of important note, ``float32`` values are stored in a unique way within the TheyerGFX engine. Each float is first read in as an ``int32``, then divided by the value ``1000.0f`` to find the true value. As such, any single-precision floating-point value read in this manner will be denoted by a ``*`` character for clarity.

An MMB file looks like:

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| char[4]      | The MMB magic ID, ``MMB`` (null-terminated).                   |
| float32*     | Format version (``0.4f``).                                     |
| uint32       | Number of ``j`` joints (>=``0``).                              |
| joint[``j``] | [Joint data](#joint).                                          |
| uint32       | Number of ``p`` points (>=``1``).                              |
| point[``p``] | [Point data](#point).                                          |
| uint32       | Number of ``n `` normals (>=``0``).                            |
| normals[``n``] | [Normal data](#normal).                                      |
| uint32       | Number of ``l`` layers (>=``1``).                              |
| layer[``l``] | [Layer data](#layer).                                          |
| uint32       | Number of ``c`` children (>=``0``).                            |
| child[``c``] | [Child data](#child).

#### Joint

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| int16        | X position of the joint (cast to a float after reading).       |
| int16        | Y position of the joint (cast to a float after reading).       |
| int16        | Z position of the joint (cast to a float after reading).       |
| int16        | Parent joint index; ``-1`` if world parented, >=``0`` otherwise. |
| uint32       | Number of points utilized by this joint.                       |

#### Point

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| int16        | X position of the point (cast to a float after reading).       |
| int16        | Y position of the point (cast to a float after reading).       |
| int16        | Z position of the point (cast to a float after reading).       |

After the point entries, if the number of points was a multiple of 2, there are 2 bytes of padding data that must be skipped.

#### Normal

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| float32*     | X position of the normal.                                      |
| float32*     | Y position of the normal.                                      |
| float32*     | Z position of the normal.                                      |

#### Layer

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| uint8        | Red color value.                                               |
| uint8        | Green color value.                                             |
| uint8        | Blue color value.                                              |
| uint8        | Double-sided flag; ``1`` for double-sided, ``0`` for not.      |
| float32*     | Transparency level; from ``0.0`` to ``1.0``.                   |
| uint32       | Number of ``t`` triangles.                                     |
| triangle[``t``] | [Triangle data](#triangle).                                 |
| limit        | Minimum [limit](#limit).                                       |
| limit        | Maximum [limit](#limit).                                       |
| char[16]     | Texture name #1 (null-terminated).                             |
| char[16]     | Texture name #2 (null-terminated).                             |
| uint8        | X-axis of the map; ``1`` is X, ``2`` is Y, ``3`` is Z.         |
| uint8        | Y-axis of the map; ``1`` is X, ``2`` is Y, ``3`` is Z.         |
| uint8        | Mirrored flag; ``1`` for mirrored, ``0`` for not.              |
| uint8        | Mirrored axis flag; ``1`` for mirrored axis, ``0`` for not.    |
| uint32       | Number of ``u`` UVs.                                           |
| uv[``u``]    | [UV data](#uv).                                                |

#### Triangle

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| uint16       | Index of a previously read point; vertex #1.                   |
| uint16       | Index of a previously read point; vertex #2.                   |
| uint16       | Index of a previously read point; vertex #3.                   |
| uint16       | Index of a previously read point; vertex #4.                   |

If vertex #4 is non-zero, then this is actually a quad. Otherwise, it's a standard triangle.

#### Limit

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| float32*     | X value of the limit.                                          |
| float32*     | Y value of the limit.                                          |
| float32*     | Z value of the limit.                                          |

#### UV

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| uint32       | Point index.                                                   |
| float32*     | U value of the UV.                                             |
| float32*     | V value of the UV.                                             |

#### Child

| Data Type    | Description                                                    |
|:-------------|:---------------------------------------------------------------|
| char[16]     | Model name (null-terminated).                                  |
| float32*     | X position of the child (>=``0.0``).                           |
| float32*     | Y position of the child (>=``0.0``).                           |
| float32*     | Z position of the child (>=``0.0``).                           |
| float32*     | X scale; ``1.0`` indicates no scaling.                         |
| float32*     | Y scale; ``1.0`` indicates no scaling.                         |
| float32*     | Z scale; ``1.0`` indicates no scaling.                         |
| float32*     | X angle (>=``0.0``).                                           |
| float32*     | Y angle (>=``0.0``).                                           |
| float32*     | Z angle (>=``0.0``).                                           |

### P1M Format

Since Mark didn't include the _California Surfing_ source code, I can't verify what the layout of this format is without diving into it. However, I'm incredibly inexperienced when it comes to model formats in particular, so I think I'll leave this one as an exercise for the reader.

... Okay, so I got a little curious and peeked into the game using Ghidra; it seems to use a similar format to MMB, except upon looking for example files, the actual P1M file is much smaller. I think P1M might be split into two sub-formats: one where the model data is stored within the ``.p1m`` file (similar to MMB), and another where some basic info is stored in a ``.p1m`` file and the model data is stored within an accompanying ``.p1d`` file (which seemingly contains a plain old HMD file). However, I haven't given this enough of a look to say for sure. Perhaps I'll come back and try to break this one down if I ever get enough knowledge when it comes to 3D models!

## Conclusion

Getting to speak with Mark was a bit of a surreal experience, since I'd never spoken to a developer of a commercial game before, let alone a developer who was working on games for the PS1. I am very grateful for his patience with me and his graciousness in releasing the source code of these games for everyone to see.

Thanks for reading!

\- Kai

[^1]: [TheyerGFX - Jet Racer / 2000](http://theyergfx.com/jetracer.htm)
[^2]: [Redump - Euro Demo 77](http://redump.org/disc/1263/)
