import z from 'zod'

const booksLibrarySchemas = {
  collections: {
    schema: z.object({
      name: z.string(),
      icon: z.string()
    }),
    raw: {
      id: 'r05dwc1jac7ni3e',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'books_library__collections',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'ldga1yg2',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'arxsnfd5',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_CJdyjxINIA` ON `books_library__collections` (`name`)'
      ],
      system: false
    }
  },
  languages: {
    schema: z.object({
      name: z.string(),
      icon: z.string()
    }),
    raw: {
      id: 'a4ffvrmdg7n66l2',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'books_library__languages',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'hbgwaemo',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'qhfzwyom',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_KB4mJFMlCd` ON `books_library__languages` (`name`)'
      ],
      system: false
    }
  },
  entries: {
    schema: z.object({
      title: z.string(),
      authors: z.string(),
      md5: z.string(),
      year_published: z.number(),
      publisher: z.string(),
      languages: z.array(z.string()),
      collection: z.string(),
      extension: z.string(),
      edition: z.string(),
      size: z.number(),
      word_count: z.number(),
      page_count: z.number(),
      isbn: z.string(),
      file: z.string(),
      thumbnail: z.string(),
      is_favourite: z.boolean(),
      time_started: z.string(),
      time_finished: z.string(),
      read_status: z.enum(['read', 'unread', 'reading']),
      created: z.string(),
      updated: z.string()
    }),
    raw: {
      id: 'zv8feknufn8yw0n',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'books_library__entries',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'ukidtfoq',
          max: 0,
          min: 0,
          name: 'title',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'rptosz2n',
          max: 0,
          min: 0,
          name: 'authors',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'k5medval',
          max: 0,
          min: 0,
          name: 'md5',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'gx0sk78p',
          max: null,
          min: null,
          name: 'year_published',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '42i6wnzo',
          max: 0,
          min: 0,
          name: 'publisher',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          cascadeDelete: false,
          collectionId: 'a4ffvrmdg7n66l2',
          hidden: false,
          id: 'lokysikf',
          maxSelect: 2147483647,
          minSelect: 0,
          name: 'languages',
          presentable: false,
          required: false,
          system: false,
          type: 'relation'
        },
        {
          cascadeDelete: false,
          collectionId: 'r05dwc1jac7ni3e',
          hidden: false,
          id: 'xdwoaiti',
          maxSelect: 1,
          minSelect: 0,
          name: 'collection',
          presentable: false,
          required: false,
          system: false,
          type: 'relation'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'makmsjfq',
          max: 0,
          min: 0,
          name: 'extension',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'tqdosxzr',
          max: 0,
          min: 0,
          name: 'edition',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: '50bxd1lm',
          max: null,
          min: null,
          name: 'size',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number4182174026',
          max: null,
          min: null,
          name: 'word_count',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number3814243252',
          max: null,
          min: null,
          name: 'page_count',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'alvrl7w4',
          max: 0,
          min: 0,
          name: 'isbn',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: '9bglnvjc',
          maxSelect: 1,
          maxSize: 524288000000,
          mimeTypes: null,
          name: 'file',
          presentable: false,
          protected: false,
          required: false,
          system: false,
          thumbs: null,
          type: 'file'
        },
        {
          hidden: false,
          id: 'v79sfyz5',
          maxSelect: 1,
          maxSize: 524288000,
          mimeTypes: [],
          name: 'thumbnail',
          presentable: false,
          protected: false,
          required: false,
          system: false,
          thumbs: ['200x0'],
          type: 'file'
        },
        {
          hidden: false,
          id: 'vkssqowy',
          name: 'is_favourite',
          presentable: false,
          required: false,
          system: false,
          type: 'bool'
        },
        {
          hidden: false,
          id: 'date3759224764',
          max: '',
          min: '',
          name: 'time_started',
          presentable: false,
          required: false,
          system: false,
          type: 'date'
        },
        {
          hidden: false,
          id: 'date3932177532',
          max: '',
          min: '',
          name: 'time_finished',
          presentable: false,
          required: false,
          system: false,
          type: 'date'
        },
        {
          hidden: false,
          id: 'select4209111981',
          maxSelect: 1,
          name: 'read_status',
          presentable: false,
          required: true,
          system: false,
          type: 'select',
          values: ['read', 'unread', 'reading']
        },
        {
          hidden: false,
          id: 'autodate2990389176',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: 'autodate3332085495',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate'
        }
      ],
      indexes: [],
      system: false
    }
  },
  file_types: {
    schema: z.object({
      name: z.string()
    }),
    raw: {
      id: '1azyegll48u5lm6',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'books_library__file_types',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'm2quzx2c',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        }
      ],
      indexes: [
        'CREATE UNIQUE INDEX `idx_MKfAEJXdDv` ON `books_library__file_types` (`name`)'
      ],
      system: false
    }
  },
  file_types_aggregated: {
    schema: z.object({
      name: z.string(),
      amount: z.number()
    }),
    raw: {
      id: 'pbc_1576322879',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'books_library__file_types_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_3Ofd',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'number2392944706',
          max: null,
          min: null,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        'SELECT\n  books_library__file_types.id,\n  books_library__file_types.name,\n  count(books_library__entries.id) as amount\nFROM books_library__file_types\n  LEFT JOIN books_library__entries ON books_library__entries.extension = books_library__file_types.name\nGROUP BY books_library__file_types.id'
    }
  },
  languages_aggregated: {
    schema: z.object({
      name: z.string(),
      icon: z.string(),
      amount: z.number()
    }),
    raw: {
      id: 'pbc_1981306955',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'books_library__languages_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_cleS',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_ir6h',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'number2392944706',
          max: null,
          min: null,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        'WITH languages_map AS (\n  SELECT \n    books_library__entries.id AS entry_id,\n    json_each.value AS lang_id\n  FROM \n    books_library__entries,\n    JSON_EACH(books_library__entries.languages)\n) SELECT\n  books_library__languages.id,\n  books_library__languages.name,\n  books_library__languages.icon,\n  count(languages_map.entry_id) as amount\nFROM books_library__languages\n  LEFT JOIN languages_map ON languages_map.lang_id = books_library__languages.id\nGROUP BY books_library__languages.id'
    }
  },
  collections_aggregated: {
    schema: z.object({
      name: z.string(),
      icon: z.string(),
      amount: z.number()
    }),
    raw: {
      id: 'pbc_3761643712',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'books_library__collections_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_w8YG',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_JDPY',
          max: 0,
          min: 0,
          name: 'icon',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'number2392944706',
          max: null,
          min: null,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        'SELECT \n  books_library__collections.id,\n  books_library__collections.name,\n  books_library__collections.icon,\n  COUNT(books_library__entries.id) as amount\nFROM books_library__collections\n  LEFT JOIN books_library__entries ON books_library__entries.collection = books_library__collections.id\nGROUP BY books_library__collections.id'
    }
  },
  read_status_aggregated: {
    schema: z.object({
      name: z.any(),
      icon: z.any(),
      color: z.any(),
      amount: z.number()
    }),
    raw: {
      id: 'pbc_1213628790',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'books_library__read_status_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'json1579384326',
          maxSize: 1,
          name: 'name',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'json1704208859',
          maxSize: 1,
          name: 'icon',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'json1716930793',
          maxSize: 1,
          name: 'color',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        },
        {
          hidden: false,
          id: 'number2392944706',
          max: null,
          min: null,
          name: 'amount',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        'SELECT \n    (ROW_NUMBER() OVER()) AS id,\n    json_extract(json_each.value, \'$.name\')  AS name,\n    json_extract(json_each.value, \'$.icon\')  AS icon,\n    json_extract(json_each.value, \'$.color\') AS color,\n    COUNT(books_library__entries.id)         AS amount\nFROM JSON_EACH(\'[\n  { "name": "read",    "icon": "tabler:progress-check",    "color": "#22c55e" },\n  { "name": "reading", "icon": "tabler:progress-bolt",  "color": "#3b82f6" },\n  { "name": "unread",  "icon": "tabler:progress", "color": "#ef4444" }\n]\')\nLEFT JOIN books_library__entries\n    ON books_library__entries.read_status = json_extract(json_each.value, \'$.name\')\nGROUP BY json_each.value;'
    }
  }
}

export default booksLibrarySchemas
