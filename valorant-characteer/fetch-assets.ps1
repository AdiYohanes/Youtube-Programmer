$path = "c:\Users\USER\OneDrive\Documents\YOUTUBE CONTENT\Programming Channel\Junior vs Senior Programmer\valorant-characteer\assets"
$json = Invoke-RestMethod -Uri "https://valorant-api.com/v1/agents?isPlayableCharacter=true"
$agents = $json.data | Where-Object { $_.displayName -in @('Jett', 'Phoenix', 'Sage') }
foreach ($agent in $agents) {
    $name = $agent.displayName.ToLower()
    Write-Host "Downloading $name..."
    Invoke-WebRequest -Uri $agent.fullPortrait -OutFile "$path\$name-portrait.png"
    Invoke-WebRequest -Uri $agent.background -OutFile "$path\$name-bg.png"
}
Write-Host "Done!"
