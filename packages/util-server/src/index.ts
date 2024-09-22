const ServerUtil = {
    backendPort: process.env.PORT || 4000,
    NODE_ENV: process.env.NODE_ENV || 'development',
};

export default ServerUtil;