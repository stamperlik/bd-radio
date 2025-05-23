AddEventHandler('onResourceStart', function(resource)
    if resource ~= GetCurrentResourceName() then
        return
    end
    PlayerData = QBCore.Functions.GetPlayerData()
    gPlayer.hasRadio = hasRadioItem(PlayerData.items)
    leaveRadio()
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then
        return
    end
    leaveRadio()
    resetPlayer()
end)

RegisterNetEvent('0R-radio:use-radio', function()
    if not PlayerData.metadata.isdead and not PlayerData.metadata.inlaststand then
        toggleRadio(not gPlayer.isMenuOpen)
        Wait(100)
        if not gHasBootAnimation then
            gHasBootAnimation = true
        end
    end
end)

RegisterNetEvent('0R-radio:use-jammer', function(item)
    local jobName = PlayerData.job.name
    local isOnDuty = PlayerData.job.onduty

    if Config.JammerSettings.restricted_jobs[jobName] and isOnDuty then
        local closestDistance, _ = checkDistanceForJammers(gSpawnedJammerObjects)
        if closestDistance == -1 then
            QBCore.Functions.Progressbar("spawn_object", _t("jammer_place_object"), 2500, false, true, {
                    disableMovement = true,
                    disableCarMovement = true,
                    disableMouse = false,
                    disableCombat = true,
                }, {
                    animDict = "anim@narcotics@trash",
                    anim = "drop_front",
                    flags = 16,
                }, {}, {},
                function() -- Done
                    StopAnimTask(PlayerPedId(), "anim@narcotics@trash", "drop_front", 1.0)
                    TriggerServerEvent('0R-radio:server:SpawnJammerObject', Config.JammerSettings.object)
                end,
                function() -- Cancel
                    StopAnimTask(PlayerPedId(), "anim@narcotics@trash", "drop_front", 1.0)
                    notify(_t("jammer_cancel_place_object"), "error")
                end
            )
        else
            notify(_t("jammer_min_distance_error"), "error")
        end
    else
        notify(_t('jammer_restricted_jobs'), 'error')
    end
end)

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    PlayerData = QBCore.Functions.GetPlayerData()
    gPlayer.hasRadio = hasRadioItem(PlayerData.items)
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    leaveRadio()
    resetPlayer()
    SendReactMessage("resetRadio")
end)

RegisterNetEvent('QBCore:Player:SetPlayerData', function(val)
    PlayerData = val
    gPlayer.hasRadio = hasRadioItem(PlayerData.items)
    if not gPlayer.hasRadio then
        leaveRadio()
        resetPlayer()
        SendReactMessage("resetRadio")
        if gPlayer.onRadio then
            notify(_t('leave_channel'), 'error')
        end
    end
end)

RegisterNetEvent('0R-radio:client:SpawnJammerObject', function(objectId, model)
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    local heading = GetEntityHeading(playerPed)
    local forward = GetEntityForwardVector(playerPed)
    local x, y, z = table.unpack(coords + forward * 2)
    local spawnedObj = CreateObject(model, x, y, z, true, false, false)
    PlaceObjectOnGroundProperly(spawnedObj)
    SetEntityHeading(spawnedObj, heading)
    SetEntityInvincible(spawnedObj, true)
    FreezeEntityPosition(spawnedObj, true)
    local spawnedObjData = {
        object = spawnedObj,
        coords = vector3(x, y, z - 0.3),
    }
    TriggerServerEvent('0R-radio:server:SetJammerObject', objectId, spawnedObjData)
end)

RegisterNetEvent('0R-radio:client:SetJammerObjects', function(data)
    gSpawnedJammerObjects = data
end)

RegisterNetEvent('0R-radio:client:RemoveJammerObject', function(objectId)
    local obj = gSpawnedJammerObjects[objectId]
    if obj then
        SetEntityInvincible(obj, false)
        FreezeEntityPosition(obj, false)
        NetworkRequestControlOfEntity(obj.object)
        DeleteObject(obj.object)
        gSpawnedJammerObjects[objectId] = nil
    end
end)

RegisterNetEvent('0R-radio:client:GetPlayersInRadioChannel', function()
    QBCore.Functions.TriggerCallback('0R-radio:server:GetPlayersInRadioChannel', function(playerlist)
        if playerlist then
            if Config.VoiceSystem == 'pma-voice' then
                for _, v in ipairs(playerlist) do
                    v.isMuted = checkPlayerMute(v.pid)
                end
            end
            SendReactMessage("setPlayersInRadioChannel", playerlist)
        else
            SendReactMessage("setPlayersInRadioChannel", {})
        end
    end, gPlayer.channel)
end)

RegisterCommand("radio", function()
    if gPlayer.hasRadio and (not PlayerData.metadata.isdead and not PlayerData.metadata.inlaststand) then
        toggleRadio(not gPlayer.isMenuOpen)
    end
end)

RegisterKeyMapping("radio", "Toggle radio item", "keyboard", Config.RadioToggleKey)
