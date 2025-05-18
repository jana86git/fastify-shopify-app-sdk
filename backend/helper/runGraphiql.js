export async function runGraphiql({ query, variables, accessToken, shop }) {
    try {
        let body = {
            query: query
        }
        if (variables) {
            body.variables = variables
        }
        const response = await fetch(`https://${shop}/admin/api/2025-04/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken
            },
            body: JSON.stringify(body)
        })
        const data = await response.json()
        return data;
    } catch (error) {
        console.log(error)
        return {
            data: null,
            error: error
        }
    }


}
