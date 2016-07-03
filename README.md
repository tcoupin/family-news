# family-news
Une appli web pour partager des photos et vidéos avec des amis et de la famille.

* middle : nodejs
* backend : mongodb (base de données et stockage grâce à GridFS)
* dépendance : imagemagick

Fonctionnalités faites ou à venir:
* authentification via Google OAuth, pas d'accès tant que l'utilisateur n'est pas vérifié
* stockage d'image et de vidéo mp4
* publication des données via des news
* commentaires des utilisateurs
* système de notification (en ligne et par mail)

## Installation
### Imagemagick
```
$ sudo apt-get install imagemagick
```
### Installation des dépendances
```
$ npm install
```
### Configuration
Modifier le fichier `src/conf/conf.json` pour définir :
* les paramètres d'authentification Google (cf http://passportjs.org/docs/google)
* le lien vers la base mongodb
