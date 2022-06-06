const { response } = require("express");
const request = require("request-promise");

async function getDataItems(uri) {
  return new Promise(function (resolve, reject) {
    request(uri, function (error, response) {
      if (error) return reject(error);
      try {
        resolve(JSON.parse(response.body));
      } catch (e) {
        reject(e);
      }
    });
  });
}

const itemsGet = (req, res = response) => {
  const searchText = req.query.q || "";
  const respSeatchItems = getDataItems(
    `https://api.mercadolibre.com/sites/MLA/search?q=${searchText}`
  );
  respSeatchItems
    .then((res) => {
      const itemsArray = res.results.splice(1, 4);
      return itemsArray.map((item) => {
        return {
          id: item.id,
          title: item.title,
          city_name: item.address.city_name,
          price: {
            currency: item.currency_id,
            amount: item.price,
            decimals: "harcoded value",
          },
          picture: item.thumbnail,
          condition: item.condition,
          free_shipping: item.shipping.free_shipping,
        };
      });
    })
    .then((items) => {
      res.json({
        author: {
          name: "Lucio",
          lastname: "Filetto",
        },
        categories: ["1", "2", "3"],
        items: items,
      });
    });
};

const itemsDetailGet = (req, res = response) => {
  const idItem = req.params.idItem;

  const detailItem = getDataItems(
    `https://api.mercadolibre.com/items/${idItem}
    `
  );

  const detailItemDescription = getDataItems(
    `https://api.mercadolibre.com/items/${idItem}/description`
  );

  detailItem
    .then((item) => {
      return {
        id: item.id,
        title: item.title,
        // city_name: item.address.city_name,
        price: {
          currency: item.currency_id,
          amount: item.price,
          decimals: "harcoded value",
        },
        picture: item.pictures[0].url,
        condition: item.condition,
        // free_shipping: item.shipping.free_shipping,
        sold_quantity: item.sold_quantity,
      };
    })
    .then((detailItem) => {
      detailItemDescription
        .then((resDescription) => {
          return resDescription.plain_text;
        })
        .then((descriptionItem) => {
          res.json({
            author: {
              name: "Lucio",
              lastname: "Filetto",
            },
            item: { ...detailItem, description: descriptionItem },
          });
        });
    });
};

module.exports = {
  itemsGet,
  itemsDetailGet,
};
