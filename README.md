# leJardinier (v2)

## Installation

`npm install`

## Configuration

[config.json](src/config/config.json):

set username:
```json
"username": "le Jardinier"
```

set an activity list to be displayed (switch between each item every 5 seconds):
```json
"activity": {
	"list": [
		"lj!help", 
		"réalisé par Synonym'#8436 (valflrt sur github)"
	]
}
```

set the prefix:
```json
"prefix": "lj!"
```

full exemple:
```json
{
	"username": "le Jardinier",
	"activity": {
		"list": [
			"lj!help",
			"réalisé par Synonym'#8436 (valflrt sur github)"
		],
		"status": "idle"
	},
	"prefix": "lj!"
}
```

token.json (i made it secret because it enables people to control the bot):

```json
"put your token here"
```

## Starting the bot

Simple start:
`npm start`

Development start:
`npm run dev`
