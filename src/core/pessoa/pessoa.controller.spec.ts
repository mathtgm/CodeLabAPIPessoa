import { Test, TestingModule } from '@nestjs/testing';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { PessoaController } from './pessoa.controller';
import { PessoaService } from './pessoa.service';

describe('PessoaController', () => {
  let controller: PessoaController;
  let service: PessoaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PessoaController],
      providers: [
        {
          provide: PessoaService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            unactivate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PessoaController>(PessoaController);
    service = module.get<PessoaService>(PessoaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await controller.create(createPessoaDto);

      expect(response.message).toEqual(EMensagem.SalvoSucesso);
      expect(response.data).toEqual(mockPessoa);
      expect(spyServiceCreate).toHaveBeenCalled();
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

      const spyServiceFindAll = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve(mockListaPessoa) as any);

      const response = await controller.findAll(1, 10);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockListaPessoa);
      expect(spyServiceFindAll).toHaveBeenCalled();
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
      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await controller.findOne(1);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockPessoa);
      expect(spyServiceFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const mockPessoa = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await controller.update(1, mockPessoa);

      expect(response.message).toEqual(EMensagem.AtualizadoSucesso);
      expect(response.data).toEqual(mockPessoa);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });

  describe('unactivate', () => {
    it('desativar um usuário', async () => {
      const spyServiceUpdate = jest
        .spyOn(service, 'unactivate')
        .mockReturnValue(Promise.resolve(false) as any);

      const response = await controller.unactivate(1);

      expect(response.message).toEqual(EMensagem.DesativadoSucesso);
      expect(response.data).toEqual(false);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });
});
