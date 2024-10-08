const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    img: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "DEFAULT"
    }
});

const Category = sequelize.define('category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    img: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    total: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

const Product = sequelize.define('product', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    introtext: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    geo: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    categoryTitle: {
        type: DataTypes.STRING,
        references: {
            model: Category,
            key: 'title'
        },
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id',
        },
        allowNull: false
    }
}, {
    hooks: {
        afterCreate: async (product, options) => {
            const category = await Category.findOne({
                where: { title: product.categoryTitle }
            });
            if (category) {
                category.total += 1;
                await category.save();
            }
        },
        afterDestroy: async (product, options) => {
            const category = await Category.findOne({
                where: { title: product.categoryTitle }
            });
            if (category) {
                category.total -= 1;
                await category.save();
            }
        }
    }
});

const Image = sequelize.define('image', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productId: {
        type: DataTypes.STRING,
        references: {
            model: Product,
            key: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        allowNull: false
    }
});

const AttributeCategory = sequelize.define('attribute-category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    categoryTitle: {
        type: DataTypes.STRING,
        references: {
            model: Category,
            key: 'title'
        },
        allowNull: false
    }
});

const Attribute = sequelize.define('attribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    attributeCategoryName: {
        type: DataTypes.STRING,
        references: {
            model: AttributeCategory,
            key: 'name'
        },
        onDelete: 'CASCADE', // Каскадное удаление
        allowNull: false
    },
    parentAttributeName: {
        type: DataTypes.STRING,
        references: {
            model: 'sub-categories', // Измените здесь на sub-categories
            key: 'name'
        },
        allowNull: true
    }
});


const SubCategory = sequelize.define('sub-category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    attributeCategoryName: {
        type: DataTypes.STRING,
        references: {
            model: AttributeCategory,
            key: 'name'
        },
        allowNull: false
    },
    parentAttributeName: {
        type: DataTypes.STRING,
        references: {
            model: Attribute,
            key: 'name'
        },
        allowNull: true
    },
    type: {
        type: DataTypes.STRING, // Тип для подкатегорий (например, select, button)
        allowNull: false
    }
});


const ProductAttribute = sequelize.define('product-attribute', {
    productId: {
        type: DataTypes.STRING,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    },
    attributeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Attribute,
            key: 'id',
            onDelete: 'CASCADE' // Каскадное удаление
        },
        allowNull: false
    },
    value: {
        type: DataTypes.STRING, // Тип может изменяться в зависимости от типа атрибута
        allowNull: false
    }
});

const Favourite = sequelize.define('favourite', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    productId: {
        type: DataTypes.STRING,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    }
});

User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

Product.hasMany(Image, { foreignKey: 'productId' });
Image.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id' });

Category.hasMany(Product, { foreignKey: 'categoryTitle', sourceKey: 'title' });
Product.belongsTo(Category, { foreignKey: 'categoryTitle', targetKey: 'title' });

Category.hasMany(AttributeCategory, { foreignKey: 'categoryTitle' });
AttributeCategory.belongsTo(Category, { foreignKey: 'categoryTitle' });

AttributeCategory.hasMany(Attribute, { foreignKey: 'attributeCategoryName', sourceKey: 'name' });
Attribute.belongsTo(AttributeCategory, { foreignKey: 'attributeCategoryName', targetKey: 'name' });

Product.hasMany(ProductAttribute, { foreignKey: 'productId' });
ProductAttribute.belongsTo(Product, { foreignKey: 'productId' });

Attribute.hasMany(ProductAttribute, { foreignKey: 'attributeId' });
ProductAttribute.belongsTo(Attribute, { foreignKey: 'attributeId' });

AttributeCategory.hasMany(SubCategory, { foreignKey: 'attributeCategoryName' });
SubCategory.belongsTo(AttributeCategory, { foreignKey: 'attributeCategoryName' });

// 2. Атрибуты могут иметь подкатегории
Attribute.hasMany(SubCategory, { foreignKey: 'parentAttributeName' });
SubCategory.belongsTo(Attribute, { foreignKey: 'parentAttributeName' });

// 3. Атрибуты могут ссылаться на родительские атрибуты в той же таблице
Attribute.hasMany(Attribute, { as: 'children', foreignKey: 'parentAttributeName' });
Attribute.belongsTo(Attribute, { as: 'parent', foreignKey: 'parentAttributeName' });


User.hasMany(Favourite, { foreignKey: 'userId' });
Favourite.belongsTo(User, { foreignKey: 'userId' });

Favourite.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Favourite, { foreignKey: 'productId' });

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    ProductAttribute,
    Attribute,
    SubCategory,
    AttributeCategory,
    Image,
    Favourite
};
