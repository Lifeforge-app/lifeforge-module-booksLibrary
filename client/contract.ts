export const contract = {
  "entries": {
    "getEpubMetadata": {
      "method": "post",
      "description": "Get EPUB file metadata",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": {
        "document": {
          "optional": false,
          "multiple": false
        }
      },
      "input": {},
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "isbn": {
              "type": "string"
            },
            "title": {
              "type": "string"
            },
            "authors": {
              "type": "string"
            },
            "publisher": {
              "type": "string"
            },
            "year_published": {
              "type": "number"
            }
          },
          "required": [
            "isbn",
            "title",
            "authors",
            "publisher",
            "year_published"
          ],
          "additionalProperties": false
        }
      }
    },
    "list": {
      "method": "get",
      "description": "Get all book entries. If the user asks for books from a specific collection, retrieve the collection ID first. Read status mapping: 1=read, 2=reading, 3=unread. Use query field for book name searches.",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "page": {
              "default": "1",
              "type": "string"
            },
            "collection": {
              "description": "Collection ID of the collection",
              "type": "string"
            },
            "language": {
              "type": "string"
            },
            "favourite": {
              "type": "string",
              "enum": [
                "true",
                "false"
              ]
            },
            "readStatus": {
              "type": "string",
              "enum": [
                "1",
                "2",
                "3"
              ]
            },
            "fileType": {
              "type": "string"
            },
            "query": {
              "type": "string"
            }
          },
          "required": [
            "page"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "page": {
              "type": "number"
            },
            "totalPages": {
              "type": "number"
            },
            "totalItems": {
              "type": "number"
            },
            "items": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "format": "uuid",
                    "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                  },
                  "title": {
                    "type": "string"
                  },
                  "authors": {
                    "type": "string"
                  },
                  "md5": {
                    "type": "string"
                  },
                  "year_published": {
                    "type": "integer",
                    "minimum": -2147483648,
                    "maximum": 2147483647
                  },
                  "publisher": {
                    "type": "string"
                  },
                  "languages": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "collection": {
                    "anyOf": [
                      {
                        "type": "string",
                        "format": "uuid",
                        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "extension": {
                    "type": "string"
                  },
                  "edition": {
                    "type": "string"
                  },
                  "size": {
                    "type": "integer",
                    "minimum": -9007199254740991,
                    "maximum": 9007199254740991
                  },
                  "word_count": {
                    "type": "integer",
                    "minimum": -2147483648,
                    "maximum": 2147483647
                  },
                  "page_count": {
                    "type": "integer",
                    "minimum": -2147483648,
                    "maximum": 2147483647
                  },
                  "isbn": {
                    "type": "string"
                  },
                  "file": {
                    "type": "string"
                  },
                  "thumbnail": {
                    "type": "string"
                  },
                  "is_favourite": {
                    "type": "boolean"
                  },
                  "time_started": {
                    "anyOf": [
                      {
                        "type": "string",
                        "format": "date-time"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "time_finished": {
                    "anyOf": [
                      {
                        "type": "string",
                        "format": "date-time"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "read_status": {
                    "type": "string"
                  },
                  "created": {
                    "type": "string",
                    "format": "date-time"
                  },
                  "updated": {
                    "type": "string",
                    "format": "date-time"
                  }
                },
                "required": [
                  "id",
                  "title",
                  "authors",
                  "md5",
                  "year_published",
                  "publisher",
                  "languages",
                  "collection",
                  "extension",
                  "edition",
                  "size",
                  "word_count",
                  "page_count",
                  "isbn",
                  "file",
                  "thumbnail",
                  "is_favourite",
                  "time_started",
                  "time_finished",
                  "read_status",
                  "created",
                  "updated"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": [
            "page",
            "totalPages",
            "totalItems",
            "items"
          ],
          "additionalProperties": false
        }
      }
    },
    "remove": {
      "method": "post",
      "description": "Delete a book entry",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "NO_CONTENT": true
      }
    },
    "sendToKindle": {
      "method": "post",
      "description": "Send book to Kindle email",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        },
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "target": {
              "type": "string",
              "format": "email",
              "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
            }
          },
          "required": [
            "target"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "string"
        }
      }
    },
    "toggleFavouriteStatus": {
      "method": "post",
      "description": "Toggle book favorite status",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "title": {
              "type": "string"
            },
            "authors": {
              "type": "string"
            },
            "md5": {
              "type": "string"
            },
            "year_published": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "publisher": {
              "type": "string"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "collection": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "uuid",
                  "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "extension": {
              "type": "string"
            },
            "edition": {
              "type": "string"
            },
            "size": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "word_count": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "page_count": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "isbn": {
              "type": "string"
            },
            "file": {
              "type": "string"
            },
            "thumbnail": {
              "type": "string"
            },
            "is_favourite": {
              "type": "boolean"
            },
            "time_started": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time"
                },
                {
                  "type": "null"
                }
              ]
            },
            "time_finished": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time"
                },
                {
                  "type": "null"
                }
              ]
            },
            "read_status": {
              "type": "string"
            },
            "created": {
              "type": "string",
              "format": "date-time"
            },
            "updated": {
              "type": "string",
              "format": "date-time"
            }
          },
          "required": [
            "id",
            "title",
            "authors",
            "md5",
            "year_published",
            "publisher",
            "languages",
            "collection",
            "extension",
            "edition",
            "size",
            "word_count",
            "page_count",
            "isbn",
            "file",
            "thumbnail",
            "is_favourite",
            "time_started",
            "time_finished",
            "read_status",
            "created",
            "updated"
          ],
          "additionalProperties": false
        }
      }
    },
    "toggleReadStatus": {
      "method": "post",
      "description": "Toggle book read status",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "title": {
              "type": "string"
            },
            "authors": {
              "type": "string"
            },
            "md5": {
              "type": "string"
            },
            "year_published": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "publisher": {
              "type": "string"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "collection": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "uuid",
                  "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "extension": {
              "type": "string"
            },
            "edition": {
              "type": "string"
            },
            "size": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "word_count": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "page_count": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "isbn": {
              "type": "string"
            },
            "file": {
              "type": "string"
            },
            "thumbnail": {
              "type": "string"
            },
            "is_favourite": {
              "type": "boolean"
            },
            "time_started": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time"
                },
                {
                  "type": "null"
                }
              ]
            },
            "time_finished": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time"
                },
                {
                  "type": "null"
                }
              ]
            },
            "read_status": {
              "type": "string"
            },
            "created": {
              "type": "string",
              "format": "date-time"
            },
            "updated": {
              "type": "string",
              "format": "date-time"
            }
          },
          "required": [
            "id",
            "title",
            "authors",
            "md5",
            "year_published",
            "publisher",
            "languages",
            "collection",
            "extension",
            "edition",
            "size",
            "word_count",
            "page_count",
            "isbn",
            "file",
            "thumbnail",
            "is_favourite",
            "time_started",
            "time_finished",
            "read_status",
            "created",
            "updated"
          ],
          "additionalProperties": false
        }
      }
    },
    "update": {
      "method": "post",
      "description": "Update an existing book entry",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        },
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "title": {
              "type": "string"
            },
            "authors": {
              "type": "string"
            },
            "edition": {
              "type": "string"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "isbn": {
              "type": "string"
            },
            "publisher": {
              "type": "string"
            },
            "year_published": {
              "type": "number"
            },
            "collection": {
              "type": "string"
            }
          },
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "title": {
              "type": "string"
            },
            "authors": {
              "type": "string"
            },
            "md5": {
              "type": "string"
            },
            "year_published": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "publisher": {
              "type": "string"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "collection": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "uuid",
                  "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "extension": {
              "type": "string"
            },
            "edition": {
              "type": "string"
            },
            "size": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "word_count": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "page_count": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "isbn": {
              "type": "string"
            },
            "file": {
              "type": "string"
            },
            "thumbnail": {
              "type": "string"
            },
            "is_favourite": {
              "type": "boolean"
            },
            "time_started": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time"
                },
                {
                  "type": "null"
                }
              ]
            },
            "time_finished": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time"
                },
                {
                  "type": "null"
                }
              ]
            },
            "read_status": {
              "type": "string"
            },
            "created": {
              "type": "string",
              "format": "date-time"
            },
            "updated": {
              "type": "string",
              "format": "date-time"
            }
          },
          "required": [
            "id",
            "title",
            "authors",
            "md5",
            "year_published",
            "publisher",
            "languages",
            "collection",
            "extension",
            "edition",
            "size",
            "word_count",
            "page_count",
            "isbn",
            "file",
            "thumbnail",
            "is_favourite",
            "time_started",
            "time_finished",
            "read_status",
            "created",
            "updated"
          ],
          "additionalProperties": false
        }
      }
    },
    "upload": {
      "method": "post",
      "description": "Upload a new book to the library",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": {
        "file": {
          "optional": false,
          "multiple": false
        }
      },
      "input": {
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "title": {
              "type": "string"
            },
            "authors": {
              "type": "string"
            },
            "edition": {
              "type": "string"
            },
            "size": {
              "type": "number"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "extension": {
              "type": "string"
            },
            "isbn": {
              "type": "string"
            },
            "publisher": {
              "type": "string"
            },
            "year_published": {
              "type": "number"
            },
            "collection": {
              "type": "string"
            }
          },
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "string"
        }
      }
    }
  },
  "collections": {
    "create": {
      "method": "post",
      "description": "Create a new book collection",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          },
          "required": [
            "name",
            "icon"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "CREATED": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "name": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "name",
            "icon"
          ],
          "additionalProperties": false
        }
      }
    },
    "list": {
      "method": "get",
      "description": "Get all book collections. If the user asks to list books in a specific collection, call this tool first to get the collection ID.",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {},
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "icon": {
                "type": "string"
              },
              "amount": {
                "type": "number"
              }
            },
            "required": [
              "id",
              "name",
              "icon",
              "amount"
            ],
            "additionalProperties": false
          }
        }
      }
    },
    "remove": {
      "method": "post",
      "description": "Delete a book collection",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "NO_CONTENT": true
      }
    },
    "update": {
      "method": "post",
      "description": "Update an existing book collection",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        },
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          },
          "required": [
            "name",
            "icon"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "name": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "name",
            "icon"
          ],
          "additionalProperties": false
        }
      }
    }
  },
  "languages": {
    "create": {
      "method": "post",
      "description": "Create a new book language",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          },
          "required": [
            "name",
            "icon"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "CREATED": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "name": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "name",
            "icon"
          ],
          "additionalProperties": false
        }
      }
    },
    "list": {
      "method": "get",
      "description": "Get all book languages",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {},
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "icon": {
                "type": "string"
              },
              "amount": {
                "type": "number"
              }
            },
            "required": [
              "id",
              "name",
              "icon",
              "amount"
            ],
            "additionalProperties": false
          }
        }
      }
    },
    "remove": {
      "method": "post",
      "description": "Delete a book language",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "NO_CONTENT": true
      }
    },
    "update": {
      "method": "post",
      "description": "Update an existing book language",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        },
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          },
          "required": [
            "name",
            "icon"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "name": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "name",
            "icon"
          ],
          "additionalProperties": false
        }
      }
    }
  },
  "fileTypes": {
    "list": {
      "method": "get",
      "description": "Get all book file types",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {},
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "amount": {
                "type": "number"
              }
            },
            "required": [
              "id",
              "name",
              "amount"
            ],
            "additionalProperties": false
          }
        }
      }
    }
  },
  "readStatus": {
    "list": {
      "method": "get",
      "description": "Get all book read statuses",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {},
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "icon": {
                "type": "string"
              },
              "color": {
                "type": "string"
              },
              "amount": {
                "type": "number"
              }
            },
            "required": [
              "id",
              "name",
              "icon",
              "color",
              "amount"
            ],
            "additionalProperties": false
          }
        }
      }
    }
  }
} as const

export default contract
