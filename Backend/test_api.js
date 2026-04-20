const testApi = async () => {
  try {
    const url = 'http://localhost:5000/api/jobs?salary=1';
    // console.log(`Testing URL: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    // console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
};

testApi();
