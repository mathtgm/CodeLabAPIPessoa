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
            exportPdf: jest.fn()
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
          nome: 'Matheus Garcia',
          documento: '12312312345',
          cep: '13484-646',
          endereco: 'R. Narciso Gonçalves, 59 - Cidade Universitária I',
          telefone: '19 996645875',
          ativo: true
        },
      ];

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

      const mockFilter = { column: '', value: '' }
      
      const spyServiceFindAll = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve({message: undefined, count: 1,data: mockListaPessoa}));

      const response = await controller.findAll(0, 10, mockOrderFilter, mockFilter);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockListaPessoa);
      expect(spyServiceFindAll).toHaveBeenCalled();
    });

  });

  describe('findOne', () => {
    it('obter um usuário', async () => {
      const mockPessoa = {
        id: 1,
        nome: 'Matheus Garcia',
        documento: '12312312345',
        cep: '13484-646',
        endereco: 'R. Narciso Gonçalves, 59 - Cidade Universitária I',
        telefone: '19 996645875',
        ativo: true
      };
      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockPessoa));

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

  describe('exportPdf', () => {
    it('gerar uma rquivo PDF', async () => {

      const mockOrderFilter = { column: 'id', sort: 'asc' as 'asc' };

      const mockFilter = { column: '', value: '' }

      const spyServiceExportPdf = jest
        .spyOn(service, 'exportPdf')
        .mockReturnValue(Promise.resolve(true));

      const response = await controller.exportPdf(1, mockOrderFilter, mockFilter);

      expect(response.message).toEqual(EMensagem.IniciadaGeracaoPDF);
      expect(response.data).toEqual(true);
      expect(spyServiceExportPdf).toHaveBeenCalled();
      expect(spyServiceExportPdf).toHaveBeenCalledWith(1, mockOrderFilter, mockFilter)
    });
  });
});
