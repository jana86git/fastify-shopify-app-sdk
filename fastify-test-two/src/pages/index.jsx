 import { Button } from "@shopify/polaris"
export default function Index() {

    async function fetchShop(){
        const res = await fetch('shopify:admin/api/graphql.json', {
            method: 'POST',
            body: JSON.stringify({
              query: `
                query shop {
                  shop {
                    name
                  }
                }
              `
            }),
          });
          
          const {data} = await res.json();
          console.log(data);
    }

    async function fetchData(){
        const res = await fetch('https://localhost:3000/server/app-two/get-data');
        const data = await res.json();
        console.log(data);
    }
  
    return (
        <div>
            <h1>Home.... FASTIFY TEST TWO</h1>
            <Button onClick={fetchShop}>Fetch Shop</Button>
            <Button onClick={fetchData}>Fetch Data</Button>
        </div>
    )
} 