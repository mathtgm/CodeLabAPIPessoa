import { fakerPT_BR as faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Pessoa } from '../src/core/pessoa/entities/pessoa.entity';
import { EMensagem } from '../src/shared/enums/mensagem.enum';
import { ResponseExceptionsFilter } from '../src/shared/filters/response-exception.filter';
import { ResponseTransformInterceptor } from '../src/shared/interceptors/response-transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  let repository: Repository<Pessoa>;

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
    let id: number;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const pessoa = {
      nome: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      senha: faker.internet.password(),
      admin: false,
      ativo: true,
    };

    it('criar um novo usuário', async () => {
      const resp = await request(app.getHttpServer())
        .post('/pessoa')
        .send(pessoa);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.SalvoSucesso);
      expect(resp.body.data).toHaveProperty('id');

      id = resp.body.data.id;
    });

    it('criar um novo usuário usando o mesmo email', async () => {
      const resp = await request(app.getHttpServer())
        .post('/pessoa')
        .send(pessoa);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.ImpossivelCadastrar);
      expect(resp.body.data).toBe(null);
    });

    it('carrega o pessoa criado', async () => {
      const resp = await request(app.getHttpServer()).get(`/pessoa/${id}`);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.nome).toBe(pessoa.nome);
      expect(resp.body.data.email).toBe(pessoa.email);
      expect(resp.body.data.ativo).toBe(pessoa.ativo);
      expect(resp.body.data.admin).toBe(pessoa.admin);
      expect(resp.body.data).toHaveProperty('permissao');
      expect(resp.body.data.password).toBe(undefined);
    });

    it('altera o pessoa criado', async () => {
      const pessoaAlterado = Object.assign(
        { id: id, ativo: false, admin: false },
        pessoa,
        {},
      );

      const resp = await request(app.getHttpServer())
        .patch(`/pessoa/${id}`)
        .send(pessoaAlterado);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.AtualizadoSucesso);
      expect(resp.body.data).toHaveProperty('id');
      expect(resp.body.data.nome).toBe(pessoaAlterado.nome);
      expect(resp.body.data.email).toBe(pessoaAlterado.email);
      expect(resp.body.data.ativo).toBe(pessoaAlterado.ativo);
      expect(resp.body.data.admin).toBe(pessoaAlterado.admin);
      expect(resp.body.data.password).toBe(undefined);
    });

    it('tenta alterar o pessoa criado passando um id diferente', async () => {
      const pessoaAlterado = Object.assign(pessoa, {
        id: id,
        ativo: false,
        admin: false,
      });

      const resp = await request(app.getHttpServer())
        .patch(`/pessoa/999`)
        .send(pessoaAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IDsDiferentes);
      expect(resp.body.data).toBe(null);
    });

    it('tenta alterar o pessoa criado com um email já utilizado', async () => {
      const firstNameTemp = faker.person.firstName();
      const lastNameTemp = faker.person.lastName();

      const pessoaTemp = {
        nome: `${firstNameTemp} ${lastNameTemp}`,
        email: faker.internet
          .email({ firstName: firstNameTemp, lastName: lastNameTemp })
          .toLowerCase(),
        senha: faker.internet.password(),
        admin: false,
        ativo: true,
      };

      await request(app.getHttpServer()).post('/pessoa').send(pessoaTemp);

      const pessoaAlterado = Object.assign(pessoa, {
        id: id,
        email: pessoaTemp.email,
      });

      const resp = await request(app.getHttpServer())
        .patch(`/pessoa/${id}`)
        .send(pessoaAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.ImpossivelAlterar);
      expect(resp.body.data).toBe(null);
    });

    it('tenta desativar um usuário inexistente', async () => {
      const resp = await request(app.getHttpServer()).delete(`/pessoa/999`);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.data).toBe(null);
    });

    it('desativa o pessoa criado', async () => {
      const resp = await request(app.getHttpServer()).delete(`/pessoa/${id}`);

      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.data).toBe(false);
    });
  });

  describe('PAGINAÇÃO (findAll) /', () => {
    it('obtem todos os registros da página 1', async () => {
      for (let i = 0; i < 10; i++) {
        const firstNameTemp = faker.person.firstName();
        const lastNameTemp = faker.person.lastName();

        const pessoa = {
          nome: `${firstNameTemp} ${lastNameTemp}`,
          email: faker.internet
            .email({ firstName: firstNameTemp, lastName: lastNameTemp })
            .toLowerCase(),
          senha: faker.internet.password(),
          admin: false,
          ativo: true,
        };

        await request(app.getHttpServer()).post('/pessoa').send(pessoa);
      }

      const resp = await request(app.getHttpServer()).get('/pessoa/1/10');

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(10);
    });

    it('obtem todos os registros da página 2', async () => {
      const resp = await request(app.getHttpServer()).get('/pessoa/2/10');

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(2);
    });
  });
});
