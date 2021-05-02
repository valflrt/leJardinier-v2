# leJardinier (v2)

## Installation

`npm install`

## configuration

To setup your bot, just change values in [config.json](./config.json):

```json
{
	"username": "le Jardinier", // name your bot
	"activity": { 
		"list": [ // sets an activity list to be display (switch between each item every 5 seconds)
			"lj!help", 
			"réalisé par Synonym'#8436 (valflrt sur github)"
		],
		"status": "idle" // sets bot status (online, idle, dnd)
	},
	"prefix": "lj!" // sets prefix
}
```

## Starting

Simple start:
`npm start`

Development start:
`npm run dev`
