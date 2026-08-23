# Taxonomy producer migration gate

Canonical category projection for every taxonomy producer:

```ts
.select('id,name,slug,parent_id,icon_key')
```

The result must flow directly to `TaxonomyOption[]`. Do not use `select('*')`, `emoji`, or `unknown as Record<string, unknown>` as a schema compatibility layer.

## Producers

- [x] Space registration — replacement blob prepared: `4bfc08d4c5fab0af391157677cf217166b3f7e7b`
- [ ] Professional registration
- [ ] Event create
- [ ] Event edit
- [ ] Community create
- [ ] Community manage

## Shared UI

- [x] Recursive `TaxonomyCombobox` replacement blob prepared: `b37efd513d8b863199e5b70505de9a8236337d90`
- [ ] Homepage category fallback cleanup
- [ ] Public search producer migration

## Exit checks

- zero category `emoji` producers
- zero category producer `select('*')` + `unknown/Record` casts
- recursive hierarchy rendered in UI
- parent search includes descendants
- type-check/build green before promotion
