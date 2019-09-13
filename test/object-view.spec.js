const ObjectView = require('../lib/object-view');
const StringView = require('../lib/string-view');
const TypedArrayViewMixin = require('../lib/typed-array-view');

class Pet extends ObjectView {}
Pet.schema = {
  age: { type: 'int8' },
  name: { type: 'string', length: 10 },
};

class House extends ObjectView {}
House.schema = {
  pets: { type: Pet, size: 3 },
};

class Person extends ObjectView {}
Person.schema = {
  age: { type: 'int8' },
  height: { type: 'float32' },
  scores: { type: 'int16', size: 5 },
  weight: { type: 'float32', littleEndian: true },
  name: { type: 'string', length: 10 },
  pet: { type: Pet },
};

class Primitives extends ObjectView {}
Primitives.schema = {
  a: { type: 'int8' },
  b: { type: 'uint8' },
  c: { type: 'int16', littleEndian: true },
  d: { type: 'uint16' },
  e: { type: 'int32', littleEndian: true },
  f: { type: 'uint32' },
  g: { type: 'float32', littleEndian: true },
  h: { type: 'float64' },
  i: { type: 'bigint64' },
  j: { type: 'biguint64' },
};

class Lists extends ObjectView {}
Lists.schema = {
  id: { type: 'uint32' },
  items: { type: 'string', size: 3, length: 10 },
};

class Invalid extends ObjectView {}
Invalid.schema = {
  a: { type: 'Int128' },
};

class BooleanView extends ObjectView {
  getBoolean(position) {
    return !!this.getUint8(position);
  }

  setBoolean(position, value) {
    this.setUint8(position, value ? 1 : 0);
  }
}
BooleanView.schema = {
  a: { type: 'boolean' },
};
BooleanView.types = {
  ...ObjectView.types,
  boolean(field) {
    field.View = DataView;
    field.length = 1;
    field.getter = 'getBoolean';
    field.setter = 'setBoolean';
  },
};
BooleanView.initialize();

class NestedBoolean extends ObjectView {}
NestedBoolean.schema = {
  a: { type: 'uint8' },
  b: { type: BooleanView, size: 2 },
};
NestedBoolean.initialize();

describe('ObjectView', () => {
  describe('constructor', () => {
    it('creates an instance of ObjectView', () => {
      const person = Person.from({});
      expect(person.buffer instanceof ArrayBuffer).toBe(true);
      expect(person.buffer.byteLength).toBe(40);
      expect(person instanceof DataView).toBe(true);
    });

    it('creates an instance using preexisting ArrayBuffer', () => {
      const buffer = new ArrayBuffer(60);
      const person = new Person(buffer, 9, 40);
      expect(person.buffer).toBe(buffer);
      expect(person.byteLength).toBe(40);
      expect(person.byteOffset).toBe(9);
    });

    it('creates an ObjectView with custom typed field', () => {
      const boolean = BooleanView.from({ a: true });
      expect(boolean instanceof BooleanView).toBe(true);
      expect(boolean.byteLength).toBe(1);
    });

    it('throws if invalid field type is used', () => {
      expect(() => { Invalid.from({}); })
        .toThrowError('Type "Int128" is not a valid type.');
    });
  });

  describe('get', () => {
    it('returns the value of a given field', () => {
      const person = Primitives.from({});
      expect(person.get('a')).toBe(0);
      expect(person.get('b')).toBe(0);
      expect(person.get('c')).toBe(0);
      expect(person.get('d')).toBe(0);
      expect(person.get('e')).toBe(0);
      expect(person.get('f')).toBe(0);
      expect(person.get('g')).toBe(0);
      expect(person.get('h')).toBe(0);
      expect(person.get('i')).toBe(BigInt(0));
      expect(person.get('j')).toBe(BigInt(0));
    });

    it('returns a StringView for a string field', () => {
      const person = Person.from({});
      const actual = person.get('name');
      expect(actual instanceof StringView).toBe(true);
      expect(actual.buffer === person.buffer).toBe(true);
      expect(actual.length).toBe(10);
    });

    it('returns a TypedArrayView from an array field', () => {
      const person = Person.from({});
      const actual = person.get('scores');
      expect(actual instanceof DataView).toBe(true);
      expect(actual.buffer === person.buffer).toBe(true);
      expect(actual.size).toBe(5);
      expect(actual.byteLength).toBe(10);
    });

    it('returns an ObjectView for an object field', () => {
      const person = Person.from({});
      const actual = person.get('pet');
      expect(actual instanceof Pet).toBe(true);
      expect(actual.buffer === person.buffer).toBe(true);
      expect(actual.byteOffset).toBe(29);
      expect(actual.byteLength).toBe(11);
    });

    it('returns an ArrayView for a string array field', () => {
      const list = Lists.from({ items: ['a'] });
      const items = list.get('items');
      expect(items instanceof DataView).toBe(true);
      expect(items.toJSON()).toEqual(['a', '', '']);
    });

    it('returns a view for a custom typed field', () => {
      const boolean = NestedBoolean.from({ a: 1, b: [{ a: true }, { a: false }] });
      expect(boolean.get('b') instanceof DataView).toBe(true);
    });
  });

  describe('getValue', () => {
    it('returns a JavaScript value contained in the field', () => {
      const object = {
        age: 10,
        height: 50,
        scores: [1, 2, 3, 0, 0],
        weight: 60,
        name: 'maga',
        pet: {
          age: 1,
          name: 'tuzik',
        },
      };
      const person = Person.from(object);
      expect(person.getValue('age')).toBe(object.age);
      expect(person.getValue('scores')).toEqual(object.scores);
      expect(person.getValue('pet')).toEqual(object.pet);
    });

    it('returns a custom field value using its getter', () => {
      const object = { a: 1, b: [{ a: true }, { a: false }] };
      const view = NestedBoolean.from(object);
      expect(view.getValue('b')).toEqual(object.b);
    });
  });

  describe('set', () => {
    it('sets a given value to a given field', () => {
      const primitives = Primitives.from({});
      expect(primitives.set('a', 1)
        .get('a')).toBe(1);
      expect(primitives.set('b', 1)
        .get('b')).toBe(1);
      expect(primitives.set('c', 1)
        .get('c')).toBe(1);
      expect(primitives.set('d', 1)
        .get('d')).toBe(1);
      expect(primitives.set('e', 1)
        .get('e')).toBe(1);
      expect(primitives.set('f', 1)
        .get('f')).toBe(1);
      expect(primitives.set('g', 1)
        .get('g')).toBe(1);
      expect(primitives.set('h', 1)
        .get('h')).toBe(1);
      expect(primitives.set('i', BigInt(1))
        .get('i')).toBe(BigInt(1));
      expect(primitives.set('j', BigInt(1))
        .get('j')).toBe(BigInt(1));
    });

    it('sets a string for a string field', () => {
      const person = Person.from({});
      person.set('name', 'maga');
      expect(person.get('name').toString()).toBe('maga');
    });

    it('sets an array for an array field', () => {
      const buffer = new ArrayBuffer(1512);
      const person = new Person(buffer, 1000);
      const array = person.get('scores');
      expect(Array.from(array)).toEqual([0, 0, 0, 0, 0]);
      person.set('scores', [1, 2, 3]);
      expect(Array.from(array)).toEqual([1, 2, 3, 0, 0]);
      expect(person.getValue('scores')).toEqual([1, 2, 3, 0, 0]);
    });

    it('zeros out non-existing elements', () => {
      const person = Person.from({ scores: [1, 2, 3, 4, 5] });
      const expected = [1, 2];
      person.set('scores', expected);
      expect(person.getValue('scores')).toEqual([1, 2, 0, 0, 0]);
    });

    it('sets an object for an object field', () => {
      const person = Person.from({});
      const pet = { age: 10, name: 'tuzik' };
      person.set('pet', pet);
      expect(person.get('pet').toJSON()).toEqual(pet);
    });

    it('zeros out non-existing fields', () => {
      const person = Person.from({ pet: { age: 10, name: 'tuzik' } });
      const expected = { age: 5 };
      person.set('pet', expected);
      expect(person.getValue('pet')).toEqual({ age: 5, name: '' });
    });

    it('sets an array of objects', () => {
      const house = House.from({});
      house.set('pets', [{ age: 5 }, { age: 6 }, { age: 7 }]);
      house.set('pets', [{ age: 10, name: 'tuzik' }]);
      expect(house.getValue('pets')).toEqual([
        { age: 10, name: 'tuzik' },
        { age: 0, name: '' },
        { age: 0, name: '' },
      ]);
    });

    it('sets an array of strings', () => {
      const items = ['a', 'abcdefg', 'h'];
      const list = Lists.from({});
      list.set('items', items);
      expect(list.toJSON()).toEqual({
        id: 0,
        items,
      });
    });

    it('sets custom type field value using its setter', () => {
      const object = { a: 1, b: [{ a: true }, { a: false }] };
      const view = NestedBoolean.from({});
      expect(view.set('b', object.b).getValue('b')).toEqual(object.b);
    });
  });

  describe('setView', () => {
    it('sets a StringView for a string field', () => {
      const person = Person.from({});
      const value = new StringView(10);
      value[0] = 35;
      value[9] = 33;
      person.setView('name', value);
      const actual = person.get('name');
      expect(actual).toEqual(value);
      expect(actual.buffer !== value.buffer).toBe(true);
    });

    it('sets a TypedArrayView for an array field', () => {
      const person = Person.from({});
      const scores = TypedArrayViewMixin('int16').from([10, 0, 0, 0, -10]);
      person.setView('scores', scores);
      expect(Array.from(person.get('scores'))).toEqual([10, 0, 0, 0, -10]);
    });

    it('sets an ObjectView for an object field', () => {
      const person = Person.from({});
      const pet = Pet.from({});
      pet.set('age', 10);
      pet.set('name', 'tuzik');
      person.setView('pet', pet);
      expect(person.getValue('pet')).toEqual({ age: 10, name: 'tuzik' });
    });
  });

  describe('toJSON', () => {
    it('returns an Object corresponding to the object view', () => {
      const person = Person.from({});
      person.set('age', 10)
        .set('height', 50)
        .set('weight', 60)
        .set('scores', [1, 2, 3])
        .set('pet', { age: 1, name: 'tuzik' })
        .set('name', 'maga');
      const result = person.toJSON();
      expect(result).toEqual({
        age: 10,
        height: 50,
        scores: [1, 2, 3, 0, 0],
        weight: 60,
        name: 'maga',
        pet: {
          age: 1,
          name: 'tuzik',
        },
      });
    });

    it('handles primitive types', () => {
      const expected = {
        a: 2, b: 3, c: 4, d: 1, e: 2, f: 4, g: 5, h: 6, i: BigInt(78), j: BigInt(97),
      };
      const primitives = Primitives.from(expected);
      expect(primitives.toJSON()).toEqual(expected);
    });

    it('handles custom type fields', () => {
      const object = { a: 1, b: [{ a: true }, { a: false }] };
      const view = NestedBoolean.from(object);
      expect(view.toJSON()).toEqual(object);
    });
  });

  describe('from', () => {
    it('creates a new object view from an object', () => {
      const object = {
        age: 10,
        height: 50,
        scores: [1, 2, 3, 0, 0],
        weight: 60,
        name: 'maga',
        pet: {
          age: 1,
          name: 'tuzik',
        },
      };
      const person = Person.from(object);
      expect(person.toJSON()).toEqual(object);
    });

    it('fills an existing object view with properties of a given object', () => {
      const object = {
        age: 10,
        height: 50,
        scores: [1, 2, 3, 0, 0],
        weight: 60,
        name: 'maga',
        pet: {
          age: 1,
          name: 'tuzik',
        },
      };
      const person = Person.from({});
      Person.from(object, person);
      expect(person.toJSON()).toEqual(object);
    });
  });

  describe('getLength', () => {
    it('returns the the byte length of an object view', () => {
      expect(Person.getLength()).toBe(40);
      expect(Pet.getLength()).toBe(11);
      expect(Primitives.getLength()).toBe(42);
    });
  });
});
