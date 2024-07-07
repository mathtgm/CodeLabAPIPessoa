import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { Pessoa } from './entities/pessoa.entity';
import { PessoaService } from './pessoa.service';

describe('PessoaService', () => {
  let service: PessoaService;
  let repository: Repository<Pessoa>;

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
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PessoaService>(PessoaService);

    repository = module.get<Repository<Pessoa>>(getRepositoryToken(Pessoa));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('criar um novo usuário', async () => {
      const createPessoaDto = {
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockPessoa = Object.assign(createPessoaDto, { id: 1 });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await service.create(createPessoaDto);

      expect(response).toEqual(mockPessoa);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao repetir um email quando criar um novo pessoa', async () => {
      const createPessoaDto = {
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockPessoa = Object.assign(createPessoaDto, { id: 1 });

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      try {
        await service.create(createPessoaDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.ImpossivelCadastrar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('findAll', () => {
    it('obter uma listagem de usuários', async () => {
      const mockListaPessoa = [
        {
          id: 1,
          nome: 'Nome Teste',
          email: 'nome.teste@teste.com',
          senha: '123456',
          ativo: true,
          admin: true,
          permissao: [],
        },
      ];

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'find')
        .mockReturnValue(Promise.resolve(mockListaPessoa) as any);

      const response = await service.findAll(1, 10);

      expect(response).toEqual(mockListaPessoa);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('obter um usuário', async () => {
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
    it('alterar um usuário', async () => {
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

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await service.update(1, updatePessoaDto);

      expect(response).toEqual(updatePessoaDto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
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

    it('lançar erro ao repetir um email já utilizado quando alterar um pessoa', async () => {
      const updatePessoaDto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockPessoaFindOne = {
        id: 2,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: 'abcdef',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockPessoaFindOne) as any);

      try {
        await service.update(1, updatePessoaDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.ImpossivelAlterar);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('unactivate', () => {
    it('desativar um usuário', async () => {
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
