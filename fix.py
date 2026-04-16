with open('server/index.js', 'r') as f:
    code = f.read()

old = "var webhookUrl = process.env.DISCORD_WEBHOOK_URL;"
new = "var webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1494050063599800450/HVP4oehh5mWDNCXJohJ3cPWOpk53Lr7S_S5W_JHZ_6wrZ0ltwoNIxlAR7DE0IXIwVQX8';"

if old in code:
    code = code.replace(old, new)
    with open('server/index.js', 'w') as f:
        f.write(code)
    print('FIXED!')
else:
    print('NOT FOUND - showing webhook lines:')
    for i, line in enumerate(code.split('\n'), 1):
        if 'webhookUrl' in line and 'DISCORD' in line:
            print(f'  Line {i}: {line.strip()}')
