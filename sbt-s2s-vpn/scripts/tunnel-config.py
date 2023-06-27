import boto3

# Session
session = boto3.Session(profile_name='core')
ec2_client = session.client('ec2')
ssm_client = session.client('ssm')

# Vars
p = ssm_client.get_parameter(Name='/sbt/vpc/vpn/1/id')
vpn_id = p['Parameter']['Value']
t1_outside_ip = '35.167.117.106'
t2_outside_ip = '54.69.223.110'
log_group_arn = 'arn:aws:logs:us-west-2:540796455178:log-group:vpn-lg'

# add for loop
# tunnels = [t1_outside, t2_outside]

response = ec2_client.modify_vpn_tunnel_options(
    VpnConnectionId=vpn_id,
    VpnTunnelOutsideIpAddress=t2_outside_ip,
    TunnelOptions={
        # 'TunnelInsideCidr': 'string',
        # 'TunnelInsideIpv6Cidr': 'string',
        # 'PreSharedKey': 'string',
        # 'Phase1LifetimeSeconds': 28800,
        # 'Phase2LifetimeSeconds': 3600,
        # 'RekeyMarginTimeSeconds': 540,
        # 'RekeyFuzzPercentage': 100,
        # 'ReplayWindowSize': 1024,
        # 'DPDTimeoutSeconds': 30,
        # 'Phase1LifetimeSeconds': Default,
        # 'Phase2LifetimeSeconds': 3600,
        # 'RekeyMarginTimeSeconds': 540,
        # 'RekeyFuzzPercentage': 100,
        # 'ReplayWindowSize': 1024,
        # 'DPDTimeoutSeconds': 30,
        # 'DPDTimeoutAction': 'clear',
        'Phase1EncryptionAlgorithms': [
            {
                'Value': 'AES256'
            },
            {
                'Value': 'AES256-GCM-16'
            }
        ],
        'Phase2EncryptionAlgorithms': [
            {
                'Value': 'AES256'
            },
            {
                'Value': 'AES256-GCM-16'
            }
        ],
        'Phase1IntegrityAlgorithms': [
            {
                'Value': 'SHA2-256'
            },
            {
                'Value': 'SHA2-384'
            },
            {
                'Value': 'SHA2-512'
            }
        ],
        'Phase2IntegrityAlgorithms': [
            {
                'Value': 'SHA2-256'
            },
            {
                'Value': 'SHA2-384'
            },
            {
                'Value': 'SHA2-512'
            }
        ],
        'Phase1DHGroupNumbers': [
            {
                'Value': 15
            },
            {
                'Value': 16
            },
            {
                'Value': 17
            },
            {
                'Value': 18
            },
            {
                'Value': 21
            },
            {
                'Value': 22
            },
            {
                'Value': 23
            }
        ],
        'Phase2DHGroupNumbers': [
            {
                'Value': 15
            },
            {
                'Value': 16
            },
            {
                'Value': 17
            },
            {
                'Value': 18
            },
            {
                'Value': 21
            },
            {
                'Value': 22
            },
            {
                'Value': 23
            }
        ],
        'IKEVersions': [
            {
                'Value': 'ikev2'
            },
        ],
        'StartupAction': 'add',
        'LogOptions': {
            'CloudWatchLogOptions': {
                'LogEnabled': True,
                'LogGroupArn': log_group_arn,
                'LogOutputFormat': 'text'
            }
        },
        'EnableTunnelLifecycleControl': True
    },
    DryRun=False,
    SkipTunnelReplacement=False
)
