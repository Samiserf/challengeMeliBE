const { response } = require("express");
const request = require("request-promise");

/* 
  function: getBreadcrumb( data : array )
  Usado para : obtener categorias del breadcrumb dependiendo la cantidad que haya, maximo 5
*/
const getBreadcrumb = (categories) => {
  const sortCategories = categories.sort((a, b) => {
    if (a.results < b.results) {
      return 1;
    }
    if (a.results > b.results) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
  if (sortCategories.length >= 5) {
    return tranformToArrayString(sortCategories.splice(0, 5));
  } else if (sortCategories.length === 0) {
    return [""];
  } else {
    return tranformToArrayString(
      sortCategories.splice(0, sortCategories.length)
    );
  }
};

/* 
  function: tranformToArrayString( data : array )
  Usado para : transforma un array de objetos a array de string, se utiliza para formatear el breadcrumb
*/
const tranformToArrayString = (array) => {
  return array.map((current) => current.name);
};

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

/* 
  function: itemsGet(  )
  Usado para : utilizado para devolver JSON que populara la vista de items buscados.
*/
const itemsGet = (req, res = response) => {
  const searchText = req.query.q || "";

  let categories = [];
  const respSeatchItems = getDataItems(
    `https://api.mercadolibre.com/sites/MLA/search?q=${searchText}`
  );
  respSeatchItems
    .then((res) => {
      const itemsArray = res.results.splice(1, 4);
      if (res.available_filters[0].id === "category") {
        categories = getBreadcrumb(res.available_filters[0].values);
      } else {
        categories = getBreadcrumb(res.filters[0].values[0].path_from_root);
      }

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
        categories: categories,
        items: items,
      });
    });
};

/* 
  function: itemsGet(  )
  Usado para : utilizado para devolver JSON que populara la vista del detalle en los productos.
*/

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
        price: {
          currency: item.currency_id,
          amount: item.price,
          decimals: "harcoded value",
        },
        picture: item.pictures[0].url,
        condition: item.condition,
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
