const SteamLoginButton = () => {
    const handleLogin = () => {
        // Points to your Spring Boot Controller on EC2 or Localhost
        window.location.href = "http://localhost:8080/api/v1/auth/login";
    };

    return (
        <button 
            onClick={handleLogin} 
            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
        >
            <img 
                src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/sits_small.png" 
                alt="Sign in through Steam" 
            />
        </button>
    );
};