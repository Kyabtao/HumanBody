# HumanBody — anatomy asset attribution and licences

This application’s source code is MIT licensed (see the repository `LICENSE`).
The anatomical **data files** and reference illustrations below have their own
licences. This notice is shipped with the application and should remain with
any redistribution of the bundled assets.

## Source-derived 3D anatomy — `models/clinical/*.glb`

The eight GLB files in `public/models/clinical/` are source-derived anatomical
geometry. They are bundled as individual, lazily loaded system layers:

- `skeletal.glb`, `joints.glb`, `muscular.glb`, `nervous.glb`,
  `cardiovascular.glb`, `organs.glb`, and `lymphatic.glb` were exported for
  the web by **Dr. Murat Altun’s Anatomi Simülatörü** from the sources below.
  The application merges and recolours them for rendering; it does not change
  their anatomical content.
- `skin.glb` is a decimated BodyParts3D/Anatomography model.

Required source chain and credit:

> **BodyParts3D, © The Database Center for Life Science (DBCLS), licensed under
> CC BY-SA 2.1 Japan.**
>
> **Z-Anatomy — The libre 3D atlas of anatomy, licensed under CC BY-SA 4.0.**

The bundled derivative 3D data is distributed under **Creative Commons
Attribution–ShareAlike 4.0 International (CC BY-SA 4.0)**. If you adapt or
redistribute these files or the derived geometry, provide the above credit,
link the licence, indicate changes, and distribute derivatives under the same
or a compatible ShareAlike licence.

- Data source: [BodyParts3D / DBCLS](https://lifesciencedb.jp/bp3d/)
- Atlas source: [Z-Anatomy models](https://github.com/Z-Anatomy/Models-of-human-anatomy)
- Web export used here: [DrMuratAltun/anatomi-simulatoru](https://github.com/DrMuratAltun/anatomi-simulatoru)
- Licence: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- Earlier source licence: [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en)

## Authentic 2D reference plates — `atlas/reference/`

The locally bundled images are 500-pixel source previews, retained with source
links and attribution so the offline application can provide real anatomical
reference plates. No medical endorsement is implied.

| File | Author / source | Licence | Source page |
| --- | --- | --- | --- |
| `clinical-overview.png` | Courtesy of NIAID; Ryan Kissinger | Public domain (NIAID / U.S. federal work) | [Human Anatomy (NIH BioArt 519–657942)](https://commons.wikimedia.org/wiki/File:Human_Anatomy_(NIH_BioArt_519_-_657942).png) |
| `skeleton-front.png` | Database Center for Life Science (DBCLS), May 2018 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [201805 human skeleton](https://commons.wikimedia.org/wiki/File:201805_human_skeleton.svg) |
| `muscular-anterior.png` | Mikael Häggström; collage of *Gray’s Anatomy* muscle illustrations | Public domain | [Muscles anterior](https://commons.wikimedia.org/wiki/File:Muscles_anterior.png) |

For the CC BY 4.0 skeleton preview, this application resized the original
source for local offline use. Please retain the DBCLS credit, licence link, and
change notice when redistributing it.
