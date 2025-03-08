fx_version 'cerulean'
game 'gta5'

author 'Quentin TRUFFY <pro.quentint@gmail.com>'
description 'Description de votre plugin'
version '1.0.0'

client_script 'dist/client/client.js'
server_script 'dist/server/server.js'

-- Configuration UI pour NUI React
ui_page 'dist/nui/index.html'

-- Fichiers à inclure pour l'interface
files {
    'dist/nui/index.html',
    'dist/nui/**/*',
}