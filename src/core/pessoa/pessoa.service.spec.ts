import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { Pessoa } from './entities/pessoa.entity';
import { PessoaService } from './pessoa.service';
import { ExportPdfService } from '../../shared/services/export-pdf.service';

describe('PessoaService', () => {
  let service: PessoaService;
  let repository: Repository<Pessoa>;
  let exportPdfService: ExportPdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoaService,
        {
          provide: getRepositoryToken(Pessoa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: 'GRPC_USUARIO',
          useValue: {
            getService: jest.fn(),
            FindOne: jest.fn()
          },
        },
        {
          provide: 'MAIL_SERVICE',
          useValue: {
            emit: jest.fn(),
            get: jest.fn()
          }
        },
        {
          provide: ExportPdfService,
          useValue: {
            export: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<PessoaService>(PessoaService);
    exportPdfService = module.get<ExportPdfService>(ExportPdfService);
    repository = module.get<Repository<Pessoa>>(getRepositoryToken(Pessoa));

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('criar uma nova pessoa', async () => {
      const createPessoaDto = {
        nome: 'Matheus Garcia',
        documento: '12312312345',
        cep: '13484-646',
        endereco: 'R. Narciso Gonçalves, 59 - Cidade Universitária I',
        telefone: '19 996645875',
        ativo: true
      };

      const mockPessoa = Object.assign(createPessoaDto, { id: 1 });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockPessoa));

      const response = await service.create(createPessoaDto);

      expect(response).toEqual(mockPessoa);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

  });

  describe('findAll', () => {
    it('obter uma listagem de pessoas', async () => {
      const mockListaPessoa = [
        {
          id: 1,
          nome: 'Matheus Garcia',
          documento: '12312312345',
          cep: '13484-646',
          endereco: 'R. Narciso Gonçalves, 59 - Cidade Universitária I',
          telefone: '19 996645875',
          ativo: true
        },
      ];

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

      const mockFilter = undefined;

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaPessoa, 1]));

      const response = await service.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaPessoa);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
    
    it('obter uma listagem de pessoas ativas', async () => {
      const mockListaPessoa = [
        {
          id: 1,
          nome: 'Matheus Garcia',
          documento: '12312312345',
          cep: '13484-646',
          endereco: 'R. Narciso Gonçalves, 59 - Cidade Universitária I',
          telefone: '19 996645875',
          ativo: true
        },
      ];

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

      const mockFilter = { column: 'ativo', value: true }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaPessoa, 1]));

      const response = await service.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaPessoa);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

    it('obter uma listagem de pessoas por id', async () => {
      const mockListaPessoa = [
        {
          id: 1,
          nome: 'Matheus Garcia',
          documento: '12312312345',
          cep: '13484-646',
          endereco: 'R. Narciso Gonçalves, 59 - Cidade Universitária I',
          telefone: '19 996645875',
          ativo: true
        },
      ];

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

      const mockFilter = { column: 'id', value: 1 }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaPessoa, 1]));

      const response = await service.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaPessoa);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
    
    it('obter uma listagem de pessoas por nome', async () => {
      const mockListaPessoa = [
        {
          id: 1,
          nome: 'Matheus Garcia',
          documento: '12312312345',
          cep: '13484-646',
          endereco: 'R. Narciso Gonçalves, 59 - Cidade Universitária I',
          telefone: '19 996645875',
          ativo: true
        },
      ];

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

      const mockFilter = { column: 'nome', value: 'matheus' }

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findAndCount')
        .mockReturnValue(Promise.resolve([mockListaPessoa, 1]));

      const response = await service.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(response.data).toEqual(mockListaPessoa);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });

  });

  describe('findOne', () => {
    it('obter uma pessoa', async () => {
      const mockPessoa = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await service.findOne(1);

      expect(response).toEqual(mockPessoa);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar uma pessoa', async () => {
      const updatePessoaDto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockPessoa = Object.assign(updatePessoaDto, {});

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await service.update(1, updatePessoaDto);

      expect(response).toEqual(updatePessoaDto);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao enviar ids diferentes quando alterar um pessoa', async () => {
      const updatePessoaDto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      try {
        await service.update(2, updatePessoaDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IDsDiferentes);
      }
    });

  });

  describe('unactivate', () => {
    it('desativar pessoa', async () => {
      const mockPessoaFindOne = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockPessoaFindOne) as any);

      const mockPessoaSave = Object.assign(mockPessoaFindOne, {
        ativo: false,
      });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockPessoaSave) as any);

      const response = await service.unactivate(1);

      expect(response).toEqual(false);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao não encontrar o pessoa usando o id quando alterar um pessoa', async () => {
      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(null) as any);

      try {
        await service.unactivate(1);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.ImpossivelAlterar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

});
