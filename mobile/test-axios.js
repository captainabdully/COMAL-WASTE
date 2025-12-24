try {
    require('axios');
    console.log('Axios resolved successfully');
} catch (error) {
    console.error('Failed to resolve axios', error);
    process.exit(1);
}
