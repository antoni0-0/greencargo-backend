import { 
  validateColombianAddress, 
  validateColombianCity, 
  validateColombianDepartment 
} from '../../shared/utils/addressValidation';

describe('Address Validation', () => {
  describe('validateColombianAddress', () => {
    it('should validate correct Colombian address formats', () => {
      const validAddresses = [
        'Calle 85 #11-42',
        'Carrera 7 #32-16',
        'Calle 100 #15-20',
        'Carrera 50 #80-25',
        'Calle 26 #68-35',
        'Carrera 13 #93-40'
      ];

      validAddresses.forEach(address => {
        expect(validateColombianAddress(address)).toBe(true);
      });
    });

    it('should reject invalid address formats', () => {
      const invalidAddresses = [
        '123 Main Street',
        'Calle sin número',
        'Carrera #-42',
        'Calle 85',
        'Carrera 7 32-16',
        'Calle 85 #11',
        'Carrera #7 #32-16',
        ''
      ];

      invalidAddresses.forEach(address => {
        expect(validateColombianAddress(address)).toBe(false);
      });
    });
  });

  describe('validateColombianCity', () => {
    it('should validate major Colombian cities', () => {
      const validCities = [
        'Bogotá',
        'Medellín',
        'Cali',
        'Barranquilla',
        'Cartagena',
        'Cúcuta',
        'Bucaramanga',
        'Pereira',
        'Santa Marta',
        'Ibagué'
      ];

      validCities.forEach(city => {
        expect(validateColombianCity(city)).toBe(true);
      });
    });

    it('should reject invalid cities', () => {
      const invalidCities = [
        'New York',
        'Madrid',
        'Lima',
        'Ciudad Inexistente',
        '',
        '123'
      ];

      invalidCities.forEach(city => {
        expect(validateColombianCity(city)).toBe(false);
      });
    });
  });

  describe('validateColombianDepartment', () => {
    it('should validate Colombian departments', () => {
      const validDepartments = [
        'Cundinamarca',
        'Antioquia',
        'Valle del Cauca',
        'Atlántico',
        'Bolívar',
        'Norte de Santander',
        'Santander',
        'Risaralda',
        'Magdalena',
        'Tolima'
      ];

      validDepartments.forEach(department => {
        expect(validateColombianDepartment(department)).toBe(true);
      });
    });

    it('should reject invalid departments', () => {
      const invalidDepartments = [
        'California',
        'Madrid',
        'Lima',
        'Departamento Inexistente',
        '',
        '123'
      ];

      invalidDepartments.forEach(department => {
        expect(validateColombianDepartment(department)).toBe(false);
      });
    });
  });
});
