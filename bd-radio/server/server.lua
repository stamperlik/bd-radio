local QBCore = exports['qb-core']:GetCoreObject()
local SpawnedObjects = {}
local UsedObjectIds = {}
-- -

QBCore.Functions.CreateUseableItem(Config.RadioItem, function(source)
    TriggerClientEvent('0R-radio:use-radio', source)
end)

if Config.JammerSettings.available then
    QBCore.Functions.CreateUseableItem(Config.JammerSettings.item_name, function(source, item)
        TriggerClientEvent('0R-radio:use-jammer', source, item)
    end)
end

if Config.VoiceSystem == "pma-voice" then
    for channel, config in pairs(Config.RestrictedChannels) do
        exports['pma-voice']:addChannelCheck(channel, function(source)
            local Player = QBCore.Functions.GetPlayer(source)
            return config[Player.PlayerData.job.name] and Player.PlayerData.job.onduty
        end)
    end
    SetConvarReplicated('voice_useNativeAudio', tostring(Config.RadioEffect))
    SetConvarReplicated('voice_enableSubmix', Config.RadioEffect and '1' or '0')
    SetConvarReplicated('voice_enableRadioAnim', Config.RadioAnimation and '1' or '0')
    SetConvarReplicated('voice_defaultRadio', Config.RadioKey)
end

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then
        return
    end
    for key, value in pairs(SpawnedObjects) do
        TriggerClientEvent('0R-radio:client:RemoveJammerObject', -1, key)
    end
end)

local function CreateObjectId()
    if next(UsedObjectIds) then
        local objectId = math.random(10000, 99999)
        while UsedObjectIds[objectId] do
            objectId = math.random(10000, 99999)
        end
        return objectId
    else
        local objectId = math.random(10000, 99999)
        return objectId
    end
end

local function getPlayersInRadioChannel(channel)
    if Config.VoiceSystem == 'pma-voice' then
        return exports['pma-voice']:getPlayersInRadioChannel(channel)
    elseif Config.VoiceSystem == 'saltychat' then
        return exports.saltychat:GetPlayersInRadioChannel(tostring(channel))
    end
    return nil
end

local function getPlayerInfo(playerSource)
    local player = QBCore.Functions.GetPlayer(playerSource)
    if player then
        local playerName = player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname
        return {
            source = playerSource,
            name = playerName,
            isMuted = false
        }
    end
    return nil
end

QBCore.Functions.CreateCallback('0R-radio:server:GetPlayersInRadioChannel', function(source, cb, channel)
    local players = getPlayersInRadioChannel(channel)
    if not players then
        cb(nil)
        return
    end

    local src = source
    local targetPlayer = nil
    local updatedPlayers = {}

    for pmaSource, saltySource in pairs(players) do
        local playerSource = (Config.VoiceSystem == 'pma-voice') and pmaSource or saltySource
        local playerInfo = getPlayerInfo(playerSource)

        if playerInfo then
            if playerSource == src then
                targetPlayer = playerInfo
            else
                updatedPlayers[#updatedPlayers + 1] = playerInfo
            end
        end
    end

    if targetPlayer then
        table.insert(updatedPlayers, 1, targetPlayer)
    end

    cb(updatedPlayers)
end)

RegisterNetEvent('0R-radio:server:SendPlayersInRadioChannel', function(channel)
    local players = getPlayersInRadioChannel(channel)
    if not players then
        return
    end

    for pmaSource, saltySource in pairs(players) do
        local playerSource = (Config.VoiceSystem == 'pma-voice') and pmaSource or saltySource
        TriggerClientEvent('0R-radio:client:GetPlayersInRadioChannel', playerSource)
    end
end)


RegisterNetEvent('0R-radio:server:SpawnJammerObject', function(model)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    local objectId = CreateObjectId()
    SpawnedObjects[objectId] = {}
    Player.Functions.RemoveItem(Config.JammerSettings.item_name, 1)
    TriggerClientEvent('0R-radio:client:SpawnJammerObject', src, objectId, model)
end)

RegisterNetEvent('0R-radio:server:SetJammerObject', function(objectId, data)
    SpawnedObjects[objectId] = data
    TriggerClientEvent('0R-radio:client:SetJammerObjects', -1, SpawnedObjects)
end)


RegisterNetEvent('0R-radio:server:DeleteJammerObject', function(objectId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    SpawnedObjects[objectId] = nil
    Player.Functions.AddItem(Config.JammerSettings.item_name, 1)
    TriggerClientEvent('0R-radio:client:RemoveJammerObject', -1, objectId)
end)
