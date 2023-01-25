const { GraphQLError } = require("graphql");
const fsPromises = require("fs/promises");
const path = require("path");
const crypto = require("node:crypto");

const { checkingExistence } = require("../lib/fileHandling");

const shoppingCartDirectory = path.join(__dirname, "../data/shopping-carts");
const productsDirectory = path.join(__dirname, "../data/products");

exports.resolvers = {
  Query: {
    getShoppingCartById: async (_, args) => {
      const shoppingCartId = args.shoppingCartId;

      const shoppingCartFilePath = path.join(
        shoppingCartDirectory,
        `${shoppingCartId}.json`
      );

      const cartExists = await checkingExistence(shoppingCartFilePath);

      if (!cartExists)
        return new GraphQLError("That id is not assigned to a shopping cart");

      const shoppingCartContent = await fsPromises.readFile(
        shoppingCartFilePath,
        { encoding: "utf-8" }
      );
      const contentData = JSON.parse(shoppingCartContent);
      return contentData;
    },
  },
  Mutation: {
    createShoppingCart: async (_, args) => {
      const newShoppingCart = {
        shoppingCartId: crypto.randomUUID(),
        shoppingCartItems: args.shoppingCartItems || [],
        totalPrice: 0,
      };

      let shoppingCartFilePath = path.join(
        shoppingCartDirectory,
        `${newShoppingCart.shoppingCartId}.json`
      );

      let idExists = true;
      while (idExists) {
        const exists = await checkingExistence(shoppingCartFilePath);

        if (exists) {
          newShoppingCart.shoppingCartId = crypto.randomUUID();
          shoppingCartFilePath = path.join(
            shoppingCartDirectory,
            `${newShoppingCart.shoppingCartId}.json`
          );
        }
        idExists = exists;
      }

      await fsPromises.writeFile(
        shoppingCartFilePath,
        JSON.stringify(newShoppingCart)
      );
      return newShoppingCart;
    },

    // createShoppingCartItem: async (_, args) => {
    // jag vill skapa ett item utan att spara den i en db? spara direct i shoppingcarten?
    //   const activeShoppingCart = args.shoppingCartId;
    //   const newShoppingCartItem = {
    //     product: args.product,
    //     quantity: args.quantity,
    //   };

    //   activeShoppingCart
    //   let shoppingCartItemFilePath = path.join(
    //     shoppingCartDirectory,
    //     `${newShoppingCartItem.shoppingCartId}.json`
    //   );

    //   let idExists = true;
    //   while (idExists) {
    //     const exists = await checkingExistence(shoppingCartItemFilePath);

    //     if (exists) {
    //       newShoppingCartItem.shoppingCartId = crypto.randomUUID();
    //       shoppingCartItemFilePath = path.join(
    //         shoppingCartDirectory,
    //         `${newShoppingCartItem.shoppingCartId}.json`
    //       );
    //     }
    //     idExists = exists;
    //   }

    //   await fsPromises.writeFile(
    //     shoppingCartItemFilePath,
    //     JSON.stringify(newShoppingCartItem)
    //   );
    //   return newShoppingCartItem;
    // },
    addItemToShoppingCart: async (_, args) => {
      //shoppingCart
      const shoppingCartId = args.input.shoppingCartId;
      const shoppingCartFilePath = path.join(
        shoppingCartDirectory,
        `${shoppingCartId}.json`
      );
      const cartExists = await checkingExistence(shoppingCartFilePath);
      if (!cartExists)
        return new GraphQLError(
          `That id (${args.input.shoppingCartId}) is not assigned to a shopping cart`
        );
      const shoppingCartContent = await fsPromises.readFile(
        shoppingCartFilePath,
        { encoding: "utf-8" }
      );
      const shoppingCartData = JSON.parse(shoppingCartContent);

      //product
      const productId = args.input.productId;
      const productFilePath = path.join(productsDirectory, `${productId}.json`);
      const productExists = await checkingExistence(productFilePath);
      if (!productExists)
        return new GraphQLError(
          `That id (${args.input.productId}) is not assigned to a product`
        );
      const product = await fsPromises.readFile(productFilePath, {
        encoding: "utf-8",
      });
      const productData = JSON.parse(product);
      //changes to cart
      let productUnitPrice = productData.unitPrice;
      let quantity = shoppingCartData.shoppingCartItems.quantity;
      let shoppingCartItems = shoppingCartData.shoppingCartItems;
      let addedItem = {
        productId: productId,
        productName: productData.productName,
        unitPrice: productUnitPrice,
        quantity: quantity,
      };
      //   let itemExists = true;
      //   const exists = await checkingExistence(shoppingCartItems);
      //   while (itemExists) {
      //     if (exists) {
      //       quantity = quantity + 1;
      //       return quantity;
      //     } else {
      shoppingCartItems.push(addedItem);
      //   shoppingCartItems = args.shoppingCartItem + addedItem;
      //   shoppingCartItems =
      //     shoppingCartItems +
      //     {
      //       productId: productId,
      //       productName: productData.productName,
      //       unitPrice: productUnitPrice,
      //       quantity: quantity,
      //     };

      //       return shoppingCartItems;
      //     }
      //     itemExists = exists;
      //   }
      const totalPrice = shoppingCartData.totalPrice;
      let newTotalPrice = totalPrice + productUnitPrice;
      //get product and make shoppingcartitem
      let updatedShoppingCart = {
        shoppingCartId: shoppingCartId,
        shoppingCartItems: shoppingCartItems,
        totalPrice: newTotalPrice,
      };

      await fsPromises.writeFile(
        shoppingCartFilePath,
        JSON.stringify(updatedShoppingCart)
      );
      //return updated shoppingCart
      return updatedShoppingCart;
    },
    // updateShoppingCartWithNewItem: (_, args) => {},
    // deleteAItemFromShoppingCart: (_, args) => {},
    // deleteAllItemsFromShoppingCart: (_, args) => {},
  },
};
