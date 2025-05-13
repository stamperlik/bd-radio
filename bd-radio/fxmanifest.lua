fx_version('cerulean')
game('gta5')
lua54 'yes'

description = 'radio script that uses qbcore lots of functions'
author = 'stamperlik'
version = '1.1.0'

client_scripts {
	'client/main.lua',
	'client/utils.lua',
	'client/functions.lua',
	'client/loops.lua',
	'client/events.lua'
}
server_script 'server/server.lua'

shared_script 'shared/**/*'

ui_page 'web/build/index.html'

files {
	'locales/**/*',
	'web/build/index.html',
	'web/build/**/*',
}

dependency "pma-voice"

escrow_ignore {
	'client/main.lua',
	'client/utils.lua',
	'client/functions.lua',
	'client/loops.lua',
	'client/events.lua',
	'server/server.lua',
	'shared/config.lua',
	'shared/locales.lua',
	'locales/en.lua'
}

dependency '/assetpacks'