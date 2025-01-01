function Main {
    if (YesNoPrompt "API" "Build backend server?") {
        $cmd = "pnpm -F market-server run build"
        PrintCmd $cmd
        Invoke-Expression $cmd
    }
    if (YesNoPrompt "Build" "Vercel build locally?") {
        $cmd = "vercel build"
        PrintCmd $cmd
        Invoke-Expression $cmd
    }
    if (YesNoPrompt "Deploy" "Deploy prebuilt on Vercel?") {
        $cmd = "vercel --prebuilt"
        PrintCmd $cmd
        Invoke-Expression $cmd
    }
}

function PrintCmd {
    param ([string] $cmd)
    Write-Host ">>> $($cmd)" -BackgroundColor DarkGreen -ForegroundColor White
}
function InputPrompt {
    param ([string] $Prompt, [System.ConsoleColor] $Color)
    do {
        $Var = $(Write-Host "$($Prompt): " -ForegroundColor $Color -NoNewLine; Read-Host).trim()
    } while ($Var -eq "")
    return $Var
}
function YesNoPrompt {
    param([string] $Title, [string] $Prompt)
    $Choice = $Host.UI.PromptForChoice($Title, $Prompt, @("&Yes", "&No"), 1)
    if ($Choice -eq 0) { return $true }
    else { return $false }
}

$CurrentDirectory = $PWD
try {
    Main
    InputPrompt "Type anything to exit" Cyan
}
catch {
    Write-Host ($_ | Out-String) -ForegroundColor Red
}
Set-Location $CurrentDirectory