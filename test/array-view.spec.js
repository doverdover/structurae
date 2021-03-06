const { ArrayViewMixin } = require('../lib/array-view');
const { ObjectView, ObjectViewMixin } = require('../lib/object-view');

const Pet = ObjectViewMixin({
  age: { type: 'int8' },
  name: { type: 'string', length: 10 },
});

const Person = ObjectViewMixin({
  age: { type: 'int8' },
  height: { type: 'float32' },
  scores: { type: 'int16', size: 5 },
  weight: { type: 'float32', littleEndian: true },
  name: { type: 'string', length: 10 },
  pets: { type: Pet, size: 2 },
  traits: { type: 'uint8', size: 10 },
});

const PeopleView = ArrayViewMixin(Person);


describe('ArrayView', () => {
  describe('ArrayViewMixin', () => {
    it('creates an array class for a given object class', () => {
      const PetsView = ArrayViewMixin(Pet);
      expect(PetsView.getLength(10)).toBe(110);
    });

    it('initializes object view if not initialized', () => {
      class Unintialized extends ObjectView {}
      Unintialized.schema = { a: { type: 'uint8' } };
      expect(Unintialized.isInitialized).toBe(false);
      ArrayViewMixin(Unintialized);
      expect(Unintialized.isInitialized).toBe(true);
    });
  });

  describe('constructor', () => {
    it('creates an array of a given size', () => {
      const array = PeopleView.of(10);
      expect(array.size).toBe(10);
      expect(array.byteOffset).toBe(0);
      expect(array.byteLength).toBe(610);
    });

    it('creates an array with a given buffer', () => {
      const buffer = new ArrayBuffer(1100);
      const array = new PeopleView(buffer, 400, 610);
      expect(array.size).toBe(10);
      expect(array.byteOffset).toBe(400);
      expect(array.byteLength).toBe(610);
    });
  });

  describe('get', () => {
    it('returns an object view at a given index', () => {
      const array = PeopleView.of(10);
      const actual = array.get(1);
      expect(actual instanceof Person).toBe(true);
      expect(actual.byteOffset).toBe(61);
      expect(actual.byteLength).toBe(61);
      expect(actual.buffer).toBe(array.buffer);
    });
  });

  describe('getValue', () => {
    it('returns an object at a given index', () => {
      const PetArray = ArrayViewMixin(Pet);
      const array = [{ age: 1, name: 'a' }, { age: 2, name: 'b' }, { age: 3, name: 'c' }];
      const pets = PetArray.from(array);
      expect(pets.getValue(0)).toEqual(array[0]);
    });
  });

  describe('set', () => {
    it('sets an object view at a given index', () => {
      const buffer = new ArrayBuffer(1100);
      const array = new PeopleView(buffer, 400, 610);
      const object = {
        age: 10,
        height: 50,
        scores: [1, 2, 3, 0, 0],
        weight: 60,
        name: 'arthur',
        pets: [
          {
            age: 1,
            name: 'dog',
          },
          {
            age: 2,
            name: 'cat',
          },
        ],
        traits: [1, 2, 3, 4, 0, 0, 0, 0, 0, 0],
      };
      const objectView = Person.from(object);
      array.setView(3, objectView);
      expect(array.get(3).toJSON()).toEqual(object);
    });

    it('sets an object at a given index', () => {
      const array = PeopleView.of(10);
      const object = {
        age: 10,
        height: 50,
        scores: [1, 2, 3, 0, 0],
        weight: 60,
        name: 'arthur',
        pets: [
          {
            age: 1,
            name: 'dog',
          },
          {
            age: 2,
            name: 'cat',
          },
        ],
        traits: [1, 2, 3, 4, 0, 0, 0, 0, 0, 0],
      };
      array.set(1, object);
      expect(array.get(1).toJSON()).toEqual(object);
    });
  });

  describe('size', () => {
    it('returns the amount of objects in the array', () => {
      const array = PeopleView.of(9);
      expect(array.byteLength).toBe(549);
      expect(array.size).toBe(9);
    });
  });

  describe('toJSON', () => {
    it('returns an array of objects in the array', () => {
      const PetArray = ArrayViewMixin(Pet);
      const expected = [{ age: 1, name: 'a' }, { age: 2, name: 'b' }, { age: 3, name: 'c' }];
      const pets = PetArray.of(3);
      pets.set(0, expected[0])
        .set(1, expected[1])
        .set(2, expected[2]);
      expect(pets.toJSON()).toEqual(expected);
    });
  });

  describe('of', () => {
    it('creates an empty ArrayView of specified size', () => {
      const people = PeopleView.of(10);
      expect(people instanceof PeopleView).toBe(true);
      expect(people.size).toBe(10);
    });

    it('creates an empty view of size 1 if no size is provided', () => {
      const people = PeopleView.of();
      expect(people instanceof PeopleView).toBe(true);
      expect(people.size).toBe(1);
    });
  });

  describe('from', () => {
    it('creates an array view from an array of objects', () => {
      const PetArray = ArrayViewMixin(Pet);
      const expected = [{ age: 1, name: 'a' }, { age: 2, name: 'b' }, { age: 3, name: 'c' }];
      const pets = PetArray.from(expected);
      expect(pets.size).toBe(3);
      expect(pets.toJSON()).toEqual(expected);
    });

    it('fills a given array view with objects', () => {
      const PetArray = ArrayViewMixin(Pet);
      const expected = [{ age: 1, name: 'a' }, { age: 2, name: 'b' }, { age: 3, name: 'c' }];
      const pets = PetArray.from(expected, PetArray.of(4));
      expect(pets.size).toBe(4);
      expect(pets.toJSON()).toEqual([...expected, { age: 0, name: '' }]);
    });
  });

  describe('getLength', () => {
    it('returns the byte length required to hold the array', () => {
      expect(PeopleView.getLength(1)).toBe(61);
      expect(PeopleView.getLength(5)).toBe(305);
    });
  });

  describe('iterator', () => {
    it('iterates over elements of the array', () => {
      const people = PeopleView.of(10);
      expect([...people].length).toBe(10);
    });
  });
});
