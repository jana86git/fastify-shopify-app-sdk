export async function getAccessToken(shopify_domain, code, client_id, client_secret) {
    try {
        console.log("shopify_domain is ::  --->>>> ", shopify_domain);
        const response = await fetch(`https://${shopify_domain}/admin/oauth/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code
            })
        });
    
        const data = await response.json();
        console.log("getting access token data is ::  --->>>> ", data);
        return data.access_token;
    } catch (error) {
        console.log("helper/getAccessToken | error is:---> ", error);
        return null;

    }
    
}