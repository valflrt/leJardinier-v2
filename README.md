# leJardinier (v2)

## Installation

`npm install`

## configuration

To setup your bot, just change values in [config.json](./config.json):

set username:
```json
{
	"username": "le Jardinier"
```

set an activity list to be displayed (switch between each item every 5 seconds):
```json
	"activity": {
		"list": [
			"lj!help", 
			"réalisé par Synonym'#8436 (valflrt sur github)"
		]
	},
```

set the prefix:
```json
	"prefix": "lj!"
}
```

## Starting

Simple start:
`npm start`

Development start:
`npm run dev`
