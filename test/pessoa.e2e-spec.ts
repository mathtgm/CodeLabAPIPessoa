import { fakerPT_BR as faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Column, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Pessoa } from '../src/core/pessoa/entities/pessoa.entity';
import { EMensagem } from '../src/shared/enums/mensagem.enum';
import { ResponseExceptionsFilter } from '../src/shared/filters/response-exception.filter';
import { ResponseTransformInterceptor } from '../src/shared/interceptors/response-transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  let repository: Repository<Pessoa>;

  let pessoaBanco;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new ResponseExceptionsFilter());

    await app.startAllMicroservices();
    await app.init();

    repository = app.get<Repository<Pessoa>>(getRepositoryToken(Pessoa));
  });

  afterAll(async () => {
    await repository.delete({});
    await app.close();
  });

  describe('CRUD /', () => {
    let idPessoa: number;

    const pessoa = {
      nome: faker.person.fullName().substring(0, 100),
      documento: faker.number.int({ max: 99999999999 }).toString(),
      cep: faker.location.zipCode('#####-###'),
      endereco: faker.location.streetAddress(),
      telefone: ` 199 ${faker.number.int({ max: 99999999 }).toString()}`,
      ativo: true
    };

    it('criar uma nova pessoa', async () => {
      const resp = await request(app.getHttpServer())
        .post('/pessoa')
        .send(pessoa);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.SalvoSucesso);
      expect(resp.body.data).toHaveProperty('id');

      idPessoa = resp.body.data.id;
      pessoaBanco = resp.body.data;
    });

    it('carrega o pessoa criada', async () => {
      const resp = await request(app.getHttpServer()).get(`/pessoa/${+idPessoa}`);
      
      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.nome).toBe(pessoa.nome);
      expect(resp.body.data.documento).toBe(pessoa.documento);
      expect(resp.body.data.cep).toBe(pessoa.cep);
      expect(resp.body.data.endereco).toBe(pessoa.endereco);
      expect(resp.body.data.telefone).toBe(pessoa.telefone);
      expect(resp.body.data.ativo).toBe(pessoa.ativo);
    });

    it('altera o pessoa criada', async () => {
      const pessoaAlterado = Object.assign(
        { id: +idPessoa, ativo: true },
        pessoa,
        {},
      );

      const resp = await request(app.getHttpServer())
        .patch(`/pessoa/${+idPessoa}`)
        .send(pessoaAlterado);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.AtualizadoSucesso);
      expect(resp.body.data).toHaveProperty('id');
      expect(resp.body.data.nome).toBe(pessoa.nome);
      expect(resp.body.data.documento).toBe(pessoa.documento);
      expect(resp.body.data.cep).toBe(pessoa.cep);
      expect(resp.body.data.endereco).toBe(pessoa.endereco);
      expect(resp.body.data.telefone).toBe(pessoa.telefone);
      expect(resp.body.data.ativo).toBe(pessoa.ativo);
    });

    it('tenta alterar o pessoa criada passando um id diferente', async () => {
      const pessoaAlterado = Object.assign(pessoa, {
        id: idPessoa,
        ativo: true,
      });

      const resp = await request(app.getHttpServer())
        .patch(`/pessoa/999`)
        .send(pessoaAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IDsDiferentes);
      expect(resp.body.data).toBe(null);
    });

    it('tenta desativar uma pessoa inexistente', async () => {
      const resp = await request(app.getHttpServer()).delete(`/pessoa/999`);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.data).toBe(null);
    });

    it('desativa o pessoa criada', async () => {
      const resp = await request(app.getHttpServer()).delete(`/pessoa/${+idPessoa}`);

      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.data).toBe(false);
    });
  });

  describe('PAGINAÇÃO (findAll) /', () => {
    const filter = {column: 'id', sort: 'asc'}

    it('obtem todos os registros da página 1', async () => {
      for (let i = 0; i < 10; i++) {

        const pessoa = {
          nome: faker.person.fullName().substring(0, 100),
          documento: faker.number.int({ min:11111111111, max: 99999999999 }).toString(),
          cep: faker.location.zipCode('#####-###'),
          endereco: faker.location.streetAddress(),
          telefone: ` 199 ${faker.number.int({ max: 99999999 }).toString()}`,
          ativo: true
        };

        await request(app.getHttpServer()).post('/pessoa').send(pessoa);
      }

      const resp = await request(app.getHttpServer()).get(`/pessoa/0/5/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(5);
    });

    it('obtem todos os registros da página 2', async () => {
      const resp = await request(app.getHttpServer()).get(`/pessoa/1/5/${JSON.stringify(filter)}`);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThan(1);
    });
    
    it('obtem todas as pessoas pelo nome', async () => {
      const resp = await request(app.getHttpServer()).get(`/pessoa/0/5/${JSON.stringify(filter)}`).query({filter: JSON.stringify({column: 'nome', value: pessoaBanco.nome})});

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });
    
    it('obtem todas as pessoas pelo id', async () => {
      const resp = await request(app.getHttpServer()).get(`/pessoa/0/5/${JSON.stringify(filter)}`).query({filter: JSON.stringify({column: 'id', value: pessoaBanco.id})});

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });
    
    it('obtem todas as pessoas ativas', async () => {
      const resp = await request(app.getHttpServer()).get(`/pessoa/0/5/${JSON.stringify(filter)}`).query({filter: JSON.stringify({column: 'ativo', value: true})});;

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
