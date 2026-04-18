export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, password, email, panel_type, ram } = req.body;

  // Validasi
  if (!username || !password || !email) {
    return res.status(400).json({
      success: false,
      message: 'Data tidak lengkap (username, password, email diperlukan)'
    });
  }

  const DOMAIN = process.env.PTERODACTYL_DOMAIN;
  const PLTA = process.env.PTERODACTYL_PLTA;

  // Validasi environment variables
  if (!DOMAIN || !PLTA) {
    return res.status(500).json({
      success: false,
      message: 'Environment variables tidak dikonfigurasi dengan benar'
    });
  }

  try {
    // 1. CREATE USER DI PTERODACTYL
    const userPayload = {
      email: email,
      username: username,
      first_name: username,
      last_name: 'Panel User',
      password: password
    };

    console.log('Creating user:', username);
    const userResponse = await callPterodactylAPI(
      DOMAIN,
      PLTA,
      '/api/application/users',
      'POST',
      userPayload
    );

    if (!userResponse.attributes || !userResponse.attributes.id) {
      const errorMsg = userResponse.errors?.[0]?.detail || 'Unknown error';
      throw new Error(`Gagal membuat user: ${errorMsg}`);
    }

    const userId = userResponse.attributes.id;
    console.log('User created successfully. ID:', userId);

    // 2. CREATE SERVER UNTUK USER
    const ramLimit = parseInt(ram) || 1024;
    const eggId = parseInt(process.env.EGG_ID || '1');
    const allocationId = parseInt(process.env.ALLOCATION_ID || '1');
    
    const serverPayload = {
      name: `Server-${username}`,
      user_id: userId,
      egg_id: eggId,
      docker_image: process.env.DOCKER_IMAGE || 'ghcr.io/pterodactyl/yolks:java_17',
      startup: 'java -Xmx{{SERVER_MEMORY}}M -Xms128M -jar server.jar nogui',
      limits: {
        memory: ramLimit,
        swap: 0,
        disk: 10000,
        io: 500,
        cpu: 100
      },
      feature_limits: {
        backups: 3,
        allocations: 1,
        databases: 1
      },
      allocation: {
        default: allocationId
      }
    };

    console.log('Creating server for user:', username);
    const serverResponse = await callPterodactylAPI(
      DOMAIN,
      PLTA,
      '/api/application/servers',
      'POST',
      serverPayload
    );

    if (!serverResponse.attributes || !serverResponse.attributes.id) {
      const errorMsg = serverResponse.errors?.[0]?.detail || 'Unknown error';
      console.log('Server creation failed:', errorMsg);
      // User berhasil tapi server gagal
      return res.status(201).json({
        success: true,
        message: 'User berhasil dibuat (Server gagal dibuat)',
        user_id: userId
      });
    }

    const serverId = serverResponse.attributes.id;
    console.log('Server created successfully. ID:', serverId);

    return res.status(201).json({
      success: true,
      message: 'Panel berhasil dibuat!',
      user_id: userId,
      server_id: serverId,
      username: username
    });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

async function callPterodactylAPI(domain, token, endpoint, method = 'GET', payload = null) {
  // Format URL dengan benar
  const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
  const url = new URL(endpoint, baseUrl).toString();

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  console.log(`[${method}] ${url}`);

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.errors?.[0]?.detail || data.message || response.statusText;
    throw new Error(`API Error (${response.status}): ${errorMsg}`);
  }

  return data;
}
